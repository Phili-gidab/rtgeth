variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "mform"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bundle_id" {
  description = "Lightsail bundle (nano_3_0 = $5/mo, micro_3_0 = $10/mo)"
  type        = string
  default     = "micro_3_0"
}

variable "repo_url" {
  description = "Git repo to deploy from"
  type        = string
  default     = "https://github.com/Phili-gidab/rtgeth.git"
}

variable "site_domain" {
  description = "Public domain (used in nginx server_name and env origins)"
  type        = string
  default     = "rtgeth.org"
}

variable "admin_email" {
  description = "Initial CMS admin email"
  type        = string
  default     = "info@rtgeth.org"
}
