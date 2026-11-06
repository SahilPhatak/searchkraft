# SearchKraft (Yuktiva) — AWS Microservices Deployment Guide

## Architecture Overview

```
                    ┌─────────────┐
                    │  Route 53   │
                    │    (DNS)    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐    ┌──────────▼──────────┐
     │   CloudFront    │    │    AWS WAF + ALB     │
     │  (Frontend CDN) │    │  (API Load Balancer) │
     └────────┬────────┘    └──────────┬──────────┘
              │                        │
     ┌────────▼────────┐    ┌──────────▼──────────┐
     │    S3 Bucket    │    │     API Gateway      │
     │  (React Build)  │    │    (Port 3000)       │
     └─────────────────┘    └──────────┬──────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │              │            │            │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌───▼────┐ ┌────▼────┐ ┌──────▼──────┐
    │ Auth Service│ │Jobs Service│ │Candidate│ │   AI    │ │  Analytics  │
    │   :3001     │ │   :3002    │ │ :3003   │ │  :3005  │ │   :3006     │
    └──────┬──────┘ └─────┬─────┘ └───┬────┘ └────┬────┘ └──────┬──────┘
           │              │           │            │              │
           └──────────────┴───────────┴────────────┴──────────────┘
                                      │
                          ┌───────────┴───────────┐
                          │                       │
                   ┌──────▼──────┐      ┌────────▼────────┐
                   │ RDS Postgres│      │ ElastiCache Redis│
                   │ (Multi-AZ)  │      │   (Sessions)     │
                   └─────────────┘      └─────────────────┘
```

## Services

| Service | Port | Responsibility |
|---------|------|---------------|
| API Gateway | 3000 | Request routing, rate limiting, CORS |
| Auth Service | 3001 | Registration, login, JWT, users, admin |
| Jobs Service | 3002 | Job CRUD, pipeline, clients |
| Candidate Service | 3003 | Candidates, applications, search, sourcing |
| Notification Service | 3004 | Notifications, tasks |
| AI Service | 3005 | JD parsing, matching, interviews, outreach |
| Analytics Service | 3006 | Dashboard stats, pipeline metrics |
| Frontend | 80 | React SPA (nginx) |

## Prerequisites

- AWS CLI v2 configured with admin access
- Terraform >= 1.5
- kubectl >= 1.28
- Helm >= 3.12
- Docker >= 24.0
- Node.js >= 20
- k6 (for load testing)

## Quick Start

```bash
# 1. Clone and navigate
git clone https://github.com/SahilPhatak/searchkraft.git
cd searchkraft

# 2. Run the bootstrap script (interactive, guides you through everything)
bash infrastructure/scripts/bootstrap-aws.sh
```

## Step-by-Step Manual Deployment

### Step 1: AWS Account Setup

```bash
# Configure AWS CLI
aws configure
# Region: ap-south-1 (Mumbai)

# Verify access
aws sts get-caller-identity
```

### Step 2: Terraform — Provision Infrastructure

```bash
cd infrastructure/terraform/environments/production

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize and apply
terraform init
terraform plan
terraform apply

# Save outputs
terraform output > ../../terraform-outputs.txt
```

This creates: VPC, EKS cluster, RDS PostgreSQL, ElastiCache Redis, ECR repos, S3 + CloudFront, WAF, IAM roles.

### Step 3: Configure kubectl

```bash
aws eks update-kubeconfig --name searchkraft-production --region ap-south-1
kubectl get nodes  # Should show 3+ nodes
```

### Step 4: Create Kubernetes Secrets

```bash
# Create namespace
kubectl apply -f infrastructure/k8s/base/namespace.yaml

# Create secrets (replace with real values from Terraform outputs)
kubectl create secret generic searchkraft-secrets \
  --namespace searchkraft \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=anthropic-api-key="your-api-key" \
  --from-literal=redis-url="redis://..."
```

### Step 5: Build & Push Docker Images

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR="${ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin "${ECR}"

# Build all services
SERVICES=(api-gateway auth-service jobs-service candidate-service notification-service ai-service analytics-service)
for svc in "${SERVICES[@]}"; do
  docker build -t "${ECR}/searchkraft/${svc}:latest" -f "services/${svc}/Dockerfile" .
  docker push "${ECR}/searchkraft/${svc}:latest"
done

# Build frontend
docker build -t "${ECR}/searchkraft/frontend:latest" -f infrastructure/docker/Dockerfile.frontend .
docker push "${ECR}/searchkraft/frontend:latest"
```

### Step 6: Run Database Migrations

```bash
# From a machine with DB access, or via a K8s job
DATABASE_URL="postgresql://..." npx prisma migrate deploy --schema services/shared/prisma/schema.prisma
```

### Step 7: Deploy to EKS

```bash
# Update image references in manifests (replace ACCOUNT_ID placeholder)
find infrastructure/k8s -name "*.yaml" -exec sed -i \
  "s|ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com|${ECR}|g" {} \;

# Deploy using kustomize
kubectl apply -k infrastructure/k8s/overlays/production

# Check status
kubectl get pods -n searchkraft
kubectl get svc -n searchkraft
kubectl get ingress -n searchkraft
```

### Step 8: Setup DNS

Point your domains to the AWS resources:
- `api.searchkraft.com` → ALB DNS name (from `kubectl get ingress -n searchkraft`)
- `app.searchkraft.com` → CloudFront distribution domain

### Step 9: Upload Frontend to S3

```bash
# Build frontend
cd apps/web
npm ci && npm run build

# Upload to S3
aws s3 sync dist/ s3://searchkraft-frontend-ACCOUNT_ID/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Step 10: Setup Monitoring

```bash
bash infrastructure/scripts/setup-monitoring.sh
```

## CI/CD Pipeline

The GitHub Actions workflow at `.github/workflows/deploy.yml` automatically:

1. Detects which services changed
2. Builds only changed service images
3. Pushes to ECR
4. Rolling-deploys to EKS

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | Your AWS account ID |
| `AWS_ACCESS_KEY_ID` | IAM user access key for CI/CD |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

## Load Testing

```bash
# Install k6: https://k6.io/docs/get-started/installation/

# Seed test users
DATABASE_URL="postgresql://..." npx tsx infrastructure/scripts/seed-load-test-users.ts

# Run small test (1000 VUs)
k6 run --vus 1000 --duration 5m infrastructure/scripts/load-test.js

# Run full 100K test
BASE_URL=https://api.searchkraft.com k6 run infrastructure/scripts/load-test.js
```

### Performance Targets

| Metric | Target |
|--------|--------|
| p95 response time | < 500ms |
| p99 response time | < 1000ms |
| Error rate | < 1% |
| Throughput | > 10,000 req/s |

## Scaling Guide

### Horizontal Scaling (automatic)
HPA is configured for all services. They auto-scale based on CPU (70%) and memory (80%).

### Vertical Scaling
For sustained high load, upgrade node instance types:
```bash
# Edit the EKS node group in Terraform
# Change instance_types from t3.xlarge to c6i.2xlarge
terraform apply
```

### Database Scaling
- Add read replicas for read-heavy workloads
- Upgrade instance class: `db.r6g.xlarge` → `db.r6g.2xlarge`
- Enable connection pooling with PgBouncer sidecar

## Monitoring & Alerts

Access Grafana:
```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Open http://localhost:3000 (admin / your-password)
```

Key dashboards to set up:
1. **Service Health** — Request rate, error rate, latency per service
2. **Kubernetes** — Pod CPU/memory, node utilization, HPA status
3. **Database** — Connection count, query duration, replication lag
4. **Business** — Active users, applications/hr, jobs posted

## Troubleshooting

```bash
# Check pod logs
kubectl logs -f deployment/auth-service -n searchkraft

# Describe a failing pod
kubectl describe pod <pod-name> -n searchkraft

# Check HPA status
kubectl get hpa -n searchkraft

# Rolling restart a service
kubectl rollout restart deployment/auth-service -n searchkraft

# Check resource usage
kubectl top pods -n searchkraft
kubectl top nodes
```

## Cost Optimization

| Resource | Monthly Cost (est.) |
|----------|-------------------|
| EKS Control Plane | $73 |
| EC2 Nodes (3-15 t3.xlarge) | $350-1,200 |
| RDS PostgreSQL (Multi-AZ) | $500 |
| ElastiCache Redis | $100 |
| CloudFront + S3 | $50-100 |
| ALB | $30 + data |
| ECR | $10 |
| **Total** | **$1,100-2,000** |

Tips:
- Use Spot Instances for non-critical services (notification, analytics)
- Reserved Instances for RDS (1-year: ~30% savings)
- Scale down dev/staging clusters outside business hours
