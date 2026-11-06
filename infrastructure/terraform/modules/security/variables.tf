variable "project_name" {
  type    = string
  default = "searchkraft"
}

variable "environment" {
  type = string
}

variable "create_waf" {
  description = "Whether to create WAF resources"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Maximum requests per 5 minutes per IP"
  type        = number
  default     = 10000
}
