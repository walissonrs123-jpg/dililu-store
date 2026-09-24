# Arquitetura V1.1

## Site público
```text
Internet -> Route 53 -> CloudFront + ACM -> S3 privado -> Next.js static export
```

## Compra
```text
Catálogo -> Carrinho (localStorage) -> wa.me -> WhatsApp Dililu
```

## Instagram gratuito
```text
src/data/products.ts
        -> content/templates/
        -> content/calendar/*.json
        -> scripts/generate-content-plan.*
        -> Markdown + CSV
        -> agendamento manual no Meta Business Suite
```

O planner fica somente no repositório/local e não exige AWS adicional.

## Infra permitida
S3, CloudFront, Route 53, ACM e GitHub Actions OIDC.

## Não adicionar sem aprovação
EC2, RDS, ECS/EKS, NAT Gateway, Lambda, API Gateway, DynamoDB, Amplify Hosting ou integração Meta.
