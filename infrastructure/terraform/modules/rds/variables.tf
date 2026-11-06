variable "project_name" {
  type    = string
  default = "searchkraft"
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "eks_node_security_group_id" {
  description = "Security group ID of EKS nodes (allowed to connect)"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.xlarge"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "searchkraft"
}

variable "db_master_username" {
  description = "Master username for RDS"
  type        = string
  default     = "searchkraft_admin"
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB"
  type        = number
  default     = 500
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "create_read_replica" {
  description = "Create a read replica"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for Secrets Manager encryption"
  type        = string
  default     = null
}

variable "kms_key_arn" {
  description = "KMS key ARN for RDS encryption"
  type        = string
  default     = null
}
