variable "project_name" {
  type    = string
  default = "searchkraft"
}

variable "environment" {
  type = string
}

variable "domain_names" {
  description = "Custom domain names for CloudFront (e.g. [\"app.yuktiva.com\"])"
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain (must be in us-east-1)"
  type        = string
  default     = null
}

variable "alb_dns_name" {
  description = "DNS name of the ALB for API origin"
  type        = string
  default     = null
}

variable "waf_web_acl_arn" {
  description = "ARN of WAF Web ACL to associate with CloudFront"
  type        = string
  default     = null
}
