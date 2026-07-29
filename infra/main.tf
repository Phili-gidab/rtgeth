# RTG website — AWS resources (mform account).
# Deliberately cPanel-portable: ONE Lightsail VM running nginx + Node + MariaDB,
# exactly the shape of a cPanel host. Nothing in the app depends on AWS —
# moving to cPanel later = copy files, import a mysqldump, set .env.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "random_password" "jwt" {
  length  = 48
  special = false
}

resource "aws_lightsail_instance" "web" {
  name              = "rtg-web"
  availability_zone = "${var.aws_region}a"
  blueprint_id      = "ubuntu_24_04"
  bundle_id         = var.bundle_id

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    db_password  = random_password.db.result
    jwt_secret   = random_password.jwt.result
    repo_url     = var.repo_url
    site_domain  = var.site_domain
    admin_email  = var.admin_email
  })

  tags = { Project = "rtgeth", Client = "RTG" }
}

resource "aws_lightsail_static_ip" "web" {
  name = "rtg-web-ip"
}

resource "aws_lightsail_static_ip_attachment" "web" {
  static_ip_name = aws_lightsail_static_ip.web.name
  instance_name  = aws_lightsail_instance.web.name
}

resource "aws_lightsail_instance_public_ports" "web" {
  instance_name = aws_lightsail_instance.web.name

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
  }
  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
  }
  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
  }
}
