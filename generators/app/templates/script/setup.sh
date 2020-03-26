#!/usr/bin/env bash

if [ "$#" -ne 2 ]; then
  echo "Use: ./setup <<USER>> <<DOMAINS>>"
  exit 1
else
  yum update -y
  curl -fsSL https://get.docker.com/ | sh
  systemctl enable docker && systemctl start docker
  usermod -aG docker "$1"
  curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  yum install -y httpd
  systemctl enable httpd && systemctl start httpd
  yum install -y epel-release
  yum install -y certbot python2-certbot-apache mod_ssl
  certbot --apache -d "$2"
fi
