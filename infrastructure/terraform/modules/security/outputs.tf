output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "anthropic_api_key_secret_arn" {
  description = "ARN of the Anthropic API key secret in Secrets Manager"
  value       = aws_secretsmanager_secret.anthropic_api_key.arn
}

output "cloudfront_waf_acl_arn" {
  description = "ARN of the CloudFront WAF Web ACL"
  value       = var.create_waf ? aws_wafv2_web_acl.cloudfront[0].arn : null
}

output "alb_waf_acl_arn" {
  description = "ARN of the ALB WAF Web ACL"
  value       = var.create_waf ? aws_wafv2_web_acl.alb[0].arn : null
}
