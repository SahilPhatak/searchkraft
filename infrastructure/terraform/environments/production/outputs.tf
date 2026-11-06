# ─── VPC ──────────────────────────────────────────────
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

# ─── EKS ─────────────────────────────────────────────
output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority" {
  description = "EKS cluster CA"
  value       = module.eks.cluster_certificate_authority
  sensitive   = true
}

output "cluster_autoscaler_role_arn" {
  description = "IAM role ARN for cluster autoscaler"
  value       = module.eks.cluster_autoscaler_role_arn
}

# ─── ECR ─────────────────────────────────────────────
output "ecr_repository_urls" {
  description = "ECR repository URLs for each service"
  value       = module.ecr.repository_urls
}

# ─── RDS ─────────────────────────────────────────────
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
}

output "rds_secret_arn" {
  description = "RDS credentials secret ARN"
  value       = module.rds.db_secret_arn
}

output "rds_read_replica_endpoint" {
  description = "RDS read replica endpoint"
  value       = module.rds.read_replica_endpoint
}

# ─── Redis ───────────────────────────────────────────
output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = module.elasticache.redis_endpoint
}

output "redis_auth_secret_arn" {
  description = "Redis auth token secret ARN"
  value       = module.elasticache.redis_auth_secret_arn
}

# ─── CloudFront ──────────────────────────────────────
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.s3_cloudfront.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.s3_cloudfront.cloudfront_domain_name
}

output "frontend_s3_bucket" {
  description = "S3 bucket for frontend"
  value       = module.s3_cloudfront.s3_bucket_name
}

# ─── Security ────────────────────────────────────────
output "kms_key_arn" {
  description = "KMS key ARN"
  value       = module.security.kms_key_arn
}

output "jwt_secret_arn" {
  description = "JWT secret ARN"
  value       = module.security.jwt_secret_arn
}
