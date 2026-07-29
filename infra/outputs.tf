output "public_ip" {
  value       = aws_lightsail_static_ip.web.ip_address
  description = "Point the domain's A record here"
}

output "ssh" {
  value       = "ssh ubuntu@${aws_lightsail_static_ip.web.ip_address}  (use the Lightsail default key from the AWS console)"
  description = "SSH access"
}

output "next_steps" {
  value = <<-EOT
    1. Point DNS A record for the domain at the public_ip above.
    2. SSH in and run: sudo certbot --nginx   (TLS)
    3. Edit /opt/rtg/server/.env — set the real CHAPA_SECRET_KEY,
       CHAPA_WEBHOOK_SECRET and ADMIN_PASSWORD, then: pm2 restart rtg-api
    4. Register the webhook in the Chapa dashboard:
       https://<domain>/api/chapa/webhook
  EOT
}
