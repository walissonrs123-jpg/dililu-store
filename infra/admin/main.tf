terraform {
  required_version = ">= 1.10, < 2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}

# Independent state: no changes to infra/site or production delivery resources.
provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["320169806724"]
  default_tags {
    tags = { Project = "Dililu", Component = "catalog-admin", ManagedBy = "Terraform" }
  }
}

locals {
  origin = "https://dililu.sofbrasil.com.br"
}

resource "aws_dynamodb_table" "products" {
  name                        = "DililuProducts"
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "productId"
  deletion_protection_enabled = true
  attribute {
    name = "productId"
    type = "S"
  }
  server_side_encryption { enabled = true }
  lifecycle { prevent_destroy = true }
}

resource "aws_cognito_user_pool" "admin" {
  name                     = "dililu-admin"
  user_pool_tier           = "LITE"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = "ACTIVE"
  admin_create_user_config { allow_admin_create_user_only = true }
  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 1
  }
  mfa_configuration = "OPTIONAL"
  software_token_mfa_configuration { enabled = true }
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  lifecycle { prevent_destroy = true }
}

resource "aws_cognito_user_group" "admin" {
  name         = "dililu-admin"
  user_pool_id = aws_cognito_user_pool.admin.id
}

resource "aws_cognito_user_pool_domain" "admin" {
  domain       = "dililu-admin-320169806724"
  user_pool_id = aws_cognito_user_pool.admin.id
}

resource "aws_cognito_user_pool_client" "admin" {
  name                                 = "dililu-admin-web"
  user_pool_id                         = aws_cognito_user_pool.admin.id
  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email"]
  supported_identity_providers         = ["COGNITO"]
  callback_urls                        = ["${local.origin}/admin"]
  logout_urls                          = ["${local.origin}/admin"]
  explicit_auth_flows                  = ["ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  access_token_validity                = 15
  id_token_validity                    = 15
  refresh_token_validity               = 1
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cloudwatch_log_group" "catalog" {
  name              = "/aws/lambda/dililu-catalog"
  retention_in_days = 7
}

resource "aws_iam_role" "catalog" {
  name               = "dililu-catalog-lambda"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}

resource "aws_iam_role_policy" "catalog" {
  name = "dililu-catalog-data"
  role = aws_iam_role.catalog.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["dynamodb:GetItem", "dynamodb:Scan", "dynamodb:PutItem"], Resource = aws_dynamodb_table.products.arn },
    { Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents"], Resource = "${aws_cloudwatch_log_group.catalog.arn}:*" }
  ] })
}

data "archive_file" "catalog" {
  type        = "zip"
  source_dir  = "${path.module}/../../services/catalog"
  output_path = "${path.module}/../../.local/dililu-catalog.zip"
}

resource "aws_lambda_function" "catalog" {
  function_name    = "dililu-catalog"
  role             = aws_iam_role.catalog.arn
  runtime          = "nodejs24.x"
  handler          = "handler.handler"
  filename         = data.archive_file.catalog.output_path
  source_code_hash = data.archive_file.catalog.output_base64sha256
  timeout          = 15
  memory_size      = 128
  environment { variables = { PRODUCTS_TABLE = aws_dynamodb_table.products.name } }
  depends_on = [aws_iam_role_policy.catalog]
}

resource "aws_apigatewayv2_api" "catalog" {
  name          = "dililu-catalog"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = [local.origin]
    allow_methods = ["GET", "PUT", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_authorizer" "admin" {
  api_id           = aws_apigatewayv2_api.catalog.id
  authorizer_type  = "JWT"
  name             = "dililu-admin"
  identity_sources = ["$request.header.Authorization"]
  jwt_configuration {
    audience = [aws_cognito_user_pool_client.admin.id]
    issuer   = "https://${aws_cognito_user_pool.admin.endpoint}"
  }
}

resource "aws_apigatewayv2_integration" "catalog" {
  api_id                 = aws_apigatewayv2_api.catalog.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.catalog.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "public" {
  for_each           = toset(["GET /products", "GET /products/{id}"])
  api_id             = aws_apigatewayv2_api.catalog.id
  route_key          = each.value
  authorization_type = "NONE"
  target             = "integrations/${aws_apigatewayv2_integration.catalog.id}"
}

resource "aws_apigatewayv2_route" "admin" {
  for_each             = toset(["GET /admin/products", "PUT /admin/products/{id}"])
  api_id               = aws_apigatewayv2_api.catalog.id
  route_key            = each.value
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.admin.id
  authorization_scopes = ["openid"]
  target               = "integrations/${aws_apigatewayv2_integration.catalog.id}"
}

resource "aws_apigatewayv2_stage" "catalog" {
  api_id      = aws_apigatewayv2_api.catalog.id
  name        = "$default"
  auto_deploy = true
  default_route_settings {
    throttling_burst_limit = 20
    throttling_rate_limit  = 10
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "DililuCatalogApi"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.catalog.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.catalog.execution_arn}/*/*/*"
}

output "frontend_environment" {
  value = {
    NEXT_PUBLIC_CATALOG_API_URL   = aws_apigatewayv2_api.catalog.api_endpoint
    NEXT_PUBLIC_COGNITO_DOMAIN    = "https://${aws_cognito_user_pool_domain.admin.domain}.auth.us-east-1.amazoncognito.com"
    NEXT_PUBLIC_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.admin.id
  }
}
output "admin_pool_id" { value = aws_cognito_user_pool.admin.id }
output "products_table" { value = aws_dynamodb_table.products.name }
