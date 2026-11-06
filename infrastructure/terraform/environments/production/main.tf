# ─── Security (KMS, Secrets, WAF) ─────────────────────
module "security" {
  source = "../../modules/security"

  project_name   = var.project_name
  environment    = var.environment
  create_waf     = var.create_waf
  waf_rate_limit = 10000

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

# ─── VPC ──────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# ─── ECR Repositories ────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# ─── EKS Cluster ─────────────────────────────────────
module "eks" {
  source = "../../modules/eks"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  cluster_version     = var.cluster_version
  node_instance_types = var.node_instance_types
  node_desired_size   = var.node_desired_size
  node_min_size       = var.node_min_size
  node_max_size       = var.node_max_size
}

# ─── RDS PostgreSQL ──────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  eks_node_security_group_id = module.eks.node_security_group_id
  db_instance_class          = var.db_instance_class
  db_master_username         = var.db_master_username
  db_name                    = var.db_name
  kms_key_id                 = module.security.kms_key_id
  kms_key_arn                = module.security.kms_key_arn
}

# ─── ElastiCache Redis ──────────────────────────────
module "elasticache" {
  source = "../../modules/elasticache"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  eks_node_security_group_id = module.eks.node_security_group_id
  node_type                  = var.redis_node_type
  kms_key_id                 = module.security.kms_key_id
}

# ─── S3 + CloudFront ────────────────────────────────
module "s3_cloudfront" {
  source = "../../modules/s3-cloudfront"

  project_name        = var.project_name
  environment         = var.environment
  domain_names        = var.domain_names
  acm_certificate_arn = var.acm_certificate_arn
  waf_web_acl_arn     = module.security.cloudfront_waf_acl_arn
  # alb_dns_name will be set after ALB is created by the ingress controller
  alb_dns_name = null
}
