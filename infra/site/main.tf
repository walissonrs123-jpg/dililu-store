terraform {
  required_version = ">= 1.10, < 2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  # This one-time deployment was authorized for the 13 site resources only.
  # Keep local state private and backed up; a remote backend is future work.
}

provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["320169806724"]
  default_tags {
    tags = { Project = "Dililu", Environment = "production", ManagedBy = "Terraform" }
  }
}

variable "publish_dns" {
  description = "Enable only after a validated site artifact has been deployed."
  type        = bool
  default     = false
}

variable "existing_certificate_arn" {
  description = "Optional issued ACM certificate in us-east-1 covering the exact hostname."
  type        = string
  default     = null
}

locals {
  domain      = "dililu.sofbrasil.com.br"
  bucket_name = "dililu-site-320169806724-prod"
}

data "aws_route53_zone" "parent" {
  zone_id = "Z0676301JLBSS7IFN575"
}

resource "aws_s3_bucket" "site" {
  bucket        = local.bucket_name
  force_destroy = false
  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule { object_ownership = "BucketOwnerEnforced" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_acm_certificate" "site" {
  count             = var.existing_certificate_arn == null ? 1 : 0
  domain_name       = local.domain
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "validation" {
  for_each = var.existing_certificate_arn == null ? {
    for option in aws_acm_certificate.site[0].domain_validation_options : option.domain_name => {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  } : {}
  zone_id         = data.aws_route53_zone.parent.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 300
  records         = [each.value.value]
  allow_overwrite = false
}

resource "aws_acm_certificate_validation" "site" {
  count                   = var.existing_certificate_arn == null ? 1 : 0
  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "dililu-s3-prod"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_cache_policy" "site" {
  name        = "dililu-static-prod"
  min_ttl     = 0
  default_ttl = 60
  max_ttl     = 31536000
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_response_headers_policy" "site" {
  name = "dililu-security-prod"
  security_headers_config {
    content_type_options { override = true }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }
  # CSP must be derived and validated against the real Next.js build in M9.
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Dililu static catalog"
  default_root_object = "index.html"
  aliases             = [local.domain]
  price_class         = "PriceClass_All"
  http_version        = "http2and3"
  wait_for_deployment = true

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "dililu-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }
  default_cache_behavior {
    target_origin_id           = "dililu-s3"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.site.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.site.id
  }
  restrictions {
    geo_restriction { restriction_type = "none" }
  }
  viewer_certificate {
    acm_certificate_arn      = var.existing_certificate_arn != null ? var.existing_certificate_arn : aws_acm_certificate_validation.site[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  dynamic "custom_error_response" {
    for_each = toset([403, 404])
    content {
      error_code            = custom_error_response.value
      response_code         = 404
      response_page_path    = "/404.html"
      error_caching_min_ttl = 10
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "CloudFrontReadOnly", Effect = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject", Resource = "${aws_s3_bucket.site.arn}/*"
        Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.site.arn } }
      },
      {
        Sid       = "DenyInsecureTransport", Effect = "Deny", Principal = "*"
        Action    = "s3:*", Resource = [aws_s3_bucket.site.arn, "${aws_s3_bucket.site.arn}/*"]
        Condition = { Bool = { "aws:SecureTransport" = "false" } }
      }
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.site]
}

resource "aws_route53_record" "site" {
  for_each        = var.publish_dns ? toset(["A", "AAAA"]) : toset([])
  zone_id         = data.aws_route53_zone.parent.zone_id
  name            = local.domain
  type            = each.value
  allow_overwrite = false
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

output "bucket" { value = aws_s3_bucket.site.id }
output "cloudfront_domain" { value = aws_cloudfront_distribution.site.domain_name }
output "distribution_id" { value = aws_cloudfront_distribution.site.id }
output "site_url" { value = "https://${local.domain}" }
