#!/bin/bash
# Setup monitoring stack on EKS
# Run after cluster is ready: bash infrastructure/scripts/setup-monitoring.sh

set -euo pipefail

echo "=== Setting up monitoring stack ==="

# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Install Prometheus + Grafana stack
echo "Installing kube-prometheus-stack..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.accessModes[0]=ReadWriteOnce \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword="${GRAFANA_PASSWORD:-admin}" \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size=10Gi \
  --set alertmanager.enabled=true \
  --wait

# Install AWS Load Balancer Controller (for ALB Ingress)
echo "Installing AWS Load Balancer Controller..."
helm upgrade --install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  --namespace kube-system \
  --set clusterName="${EKS_CLUSTER_NAME:-searchkraft-production}" \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --wait || echo "AWS LB Controller may already be installed"

# Install metrics-server if not present
kubectl get deployment metrics-server -n kube-system > /dev/null 2>&1 || {
  echo "Installing metrics-server..."
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
}

# Install Cluster Autoscaler
echo "Installing Cluster Autoscaler..."
helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler \
  --namespace kube-system \
  --set autoDiscovery.clusterName="${EKS_CLUSTER_NAME:-searchkraft-production}" \
  --set awsRegion="${AWS_REGION:-ap-south-1}" \
  --set rbac.serviceAccount.create=true \
  --wait || echo "Cluster Autoscaler may need manual IAM setup"

echo ""
echo "=== Monitoring setup complete ==="
echo "Grafana: kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
echo "Prometheus: kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring"
echo ""
echo "Default Grafana credentials: admin / ${GRAFANA_PASSWORD:-admin}"
