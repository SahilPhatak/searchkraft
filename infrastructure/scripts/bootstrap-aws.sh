#!/bin/bash
# SearchKraft AWS Bootstrap Script
# This script sets up the complete AWS infrastructure from scratch.
# Prerequisites: AWS CLI configured, Terraform installed, kubectl installed, Helm installed
#
# Usage: bash infrastructure/scripts/bootstrap-aws.sh

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
CLUSTER_NAME="${CLUSTER_NAME:-searchkraft-production}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "============================================"
echo "SearchKraft AWS Infrastructure Bootstrap"
echo "============================================"
echo "Region:     ${AWS_REGION}"
echo "Cluster:    ${CLUSTER_NAME}"
echo "Account ID: ${ACCOUNT_ID}"
echo "============================================"
echo ""

# ─── Step 1: Create Terraform State Backend ──────────────
echo "=== Step 1: Creating Terraform state backend ==="
STATE_BUCKET="searchkraft-terraform-state-${ACCOUNT_ID}"
LOCK_TABLE="searchkraft-terraform-locks"

aws s3api create-bucket \
  --bucket "${STATE_BUCKET}" \
  --region "${AWS_REGION}" \
  --create-bucket-configuration LocationConstraint="${AWS_REGION}" \
  2>/dev/null || echo "State bucket already exists"

aws s3api put-bucket-versioning \
  --bucket "${STATE_BUCKET}" \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name "${LOCK_TABLE}" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "${AWS_REGION}" \
  2>/dev/null || echo "Lock table already exists"

echo "Terraform state backend ready: s3://${STATE_BUCKET}"
echo ""

# ─── Step 2: Run Terraform ───────────────────────────────
echo "=== Step 2: Provisioning infrastructure with Terraform ==="
cd infrastructure/terraform/environments/production

# Create terraform.tfvars if not exists
if [ ! -f terraform.tfvars ]; then
  echo "Creating terraform.tfvars from example..."
  cp terraform.tfvars.example terraform.tfvars
  echo ""
  echo "!!! IMPORTANT: Edit terraform.tfvars with your values before continuing !!!"
  echo "File: infrastructure/terraform/environments/production/terraform.tfvars"
  echo ""
  read -p "Press Enter after editing terraform.tfvars..."
fi

# Update backend config
cat > backend.tf << EOF
terraform {
  backend "s3" {
    bucket         = "${STATE_BUCKET}"
    key            = "searchkraft/production/terraform.tfstate"
    region         = "${AWS_REGION}"
    dynamodb_table = "${LOCK_TABLE}"
    encrypt        = true
  }
}
EOF

terraform init
terraform plan -out=tfplan
echo ""
read -p "Review the plan above. Apply? (yes/no): " APPLY
if [ "${APPLY}" = "yes" ]; then
  terraform apply tfplan
else
  echo "Terraform apply cancelled."
  exit 1
fi

cd ../../../..
echo ""

# ─── Step 3: Configure kubectl ───────────────────────────
echo "=== Step 3: Configuring kubectl ==="
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${AWS_REGION}"
kubectl get nodes
echo ""

# ─── Step 4: Create ECR Repositories ────────────────────
echo "=== Step 4: Creating ECR repositories ==="
SERVICES=(api-gateway auth-service jobs-service candidate-service notification-service ai-service analytics-service frontend)
for svc in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name "searchkraft/${svc}" \
    --region "${AWS_REGION}" \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null || echo "  Repository searchkraft/${svc} already exists"
done
echo ""

# ─── Step 5: Create Kubernetes Namespace & Secrets ───────
echo "=== Step 5: Setting up Kubernetes namespace and secrets ==="
kubectl create namespace searchkraft --dry-run=client -o yaml | kubectl apply -f -

# Fetch secrets from Terraform outputs or AWS Secrets Manager
DB_URL=$(terraform -chdir=infrastructure/terraform/environments/production output -raw database_url 2>/dev/null || echo "REPLACE_WITH_DATABASE_URL")
REDIS_URL=$(terraform -chdir=infrastructure/terraform/environments/production output -raw redis_url 2>/dev/null || echo "REPLACE_WITH_REDIS_URL")

echo ""
echo "Creating Kubernetes secrets..."
echo "You will need to provide the following values:"
read -sp "JWT_SECRET: " JWT_SECRET; echo ""
read -sp "ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY; echo ""

kubectl create secret generic searchkraft-secrets \
  --namespace searchkraft \
  --from-literal=database-url="${DB_URL}" \
  --from-literal=jwt-secret="${JWT_SECRET}" \
  --from-literal=anthropic-api-key="${ANTHROPIC_API_KEY}" \
  --from-literal=redis-url="${REDIS_URL}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo ""

# ─── Step 6: Build & Push Docker Images ──────────────────
echo "=== Step 6: Building and pushing Docker images ==="
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

for svc in "${SERVICES[@]}"; do
  echo "Building ${svc}..."
  if [ "${svc}" = "frontend" ]; then
    DOCKERFILE="infrastructure/docker/Dockerfile.frontend"
  else
    DOCKERFILE="services/${svc}/Dockerfile"
  fi

  docker build -t "${ECR_REGISTRY}/searchkraft/${svc}:latest" -f "${DOCKERFILE}" .
  docker push "${ECR_REGISTRY}/searchkraft/${svc}:latest"
  echo "  Pushed ${svc}"
done
echo ""

# ─── Step 7: Run Database Migrations ────────────────────
echo "=== Step 7: Running database migrations ==="
# Run Prisma migrate from a temporary pod
kubectl run prisma-migrate \
  --namespace searchkraft \
  --image="${ECR_REGISTRY}/searchkraft/auth-service:latest" \
  --restart=Never \
  --env="DATABASE_URL=${DB_URL}" \
  --command -- npx prisma migrate deploy

kubectl wait --for=condition=Ready pod/prisma-migrate -n searchkraft --timeout=120s 2>/dev/null || true
kubectl logs prisma-migrate -n searchkraft 2>/dev/null || true
kubectl delete pod prisma-migrate -n searchkraft 2>/dev/null || true
echo ""

# ─── Step 8: Deploy to Kubernetes ────────────────────────
echo "=== Step 8: Deploying services to EKS ==="

# Update image references in manifests
for svc in "${SERVICES[@]}"; do
  # Update deployment image in base manifests
  find infrastructure/k8s/base -name "deployment.yaml" -exec \
    sed -i "s|ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com|${ECR_REGISTRY}|g" {} \;
done

# Apply with kustomize
kubectl apply -k infrastructure/k8s/overlays/production
echo ""

# ─── Step 9: Wait for deployments ───────────────────────
echo "=== Step 9: Waiting for deployments to be ready ==="
for svc in "${SERVICES[@]}"; do
  echo "  Waiting for ${svc}..."
  kubectl rollout status deployment/${svc} -n searchkraft --timeout=300s || echo "  ${svc} may still be starting"
done
echo ""

# ─── Step 10: Setup Monitoring ───────────────────────────
echo "=== Step 10: Setting up monitoring ==="
bash infrastructure/scripts/setup-monitoring.sh
echo ""

# ─── Done ────────────────────────────────────────────────
echo "============================================"
echo "SearchKraft deployment complete!"
echo "============================================"
echo ""
echo "Useful commands:"
echo "  kubectl get pods -n searchkraft                    # Check pod status"
echo "  kubectl get svc -n searchkraft                     # Check services"
echo "  kubectl get ingress -n searchkraft                 # Check ingress/ALB URL"
echo "  kubectl logs -f deployment/api-gateway -n searchkraft  # View gateway logs"
echo "  kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring  # Grafana"
echo ""
echo "Next steps:"
echo "  1. Configure DNS: Point api.searchkraft.com to the ALB"
echo "  2. Upload frontend to S3/CloudFront or use the frontend deployment"
echo "  3. Run load tests: k6 run infrastructure/scripts/load-test.js"
echo "  4. Set up GitHub Actions secrets for CI/CD"
echo "============================================"
