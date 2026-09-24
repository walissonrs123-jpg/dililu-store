# Infraestrutura Dililu — preparação

Conta validada: `320169806724`. Região: `us-east-1`.
Domínio: `dililu.sofbrasil.com.br`. Zona existente: `Z0676301JLBSS7IFN575`.

`bootstrap/` prepara um bucket separado para estado Terraform, com versionamento,
criptografia, bloqueio público, TLS obrigatório e proteção contra destruição.
`site/` prepara S3 privado, CloudFront/OAC, certificado específico e validação DNS.
Não modifica os certificados existentes nem assume o gerenciamento da zona inteira.
`publish_dns=false` impede publicar o endereço antes de existir um build aprovado.
PriceClass_All inclui os pontos de presença sul-americanos; revisar custo antes da aplicação.

## Validação local

A CLI AWS e o Terraform foram extraídos em `.tools/` (ignorada no Git).
O arquivo `awsTemp` também está ignorado. O script carrega o par IAM somente no
ambiente do processo e restaura o ambiente ao terminar. Ele não cria um perfil global.
Não habilitar debug ou transcrição ao trabalhar com credenciais.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/Test-AwsAccess.ps1
.tools/terraform/terraform.exe -chdir=infra/bootstrap fmt -check
.tools/terraform/terraform.exe -chdir=infra/bootstrap init -backend=false
.tools/terraform/terraform.exe -chdir=infra/bootstrap validate
.tools/terraform/terraform.exe -chdir=infra/site fmt -check
.tools/terraform/terraform.exe -chdir=infra/site init -backend=false
.tools/terraform/terraform.exe -chdir=infra/site validate
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/Test-AwsAccess.ps1 -Plan
```

Os planos salvos ficam em `.local/`, fora do versionamento. Eles não comprovam
permissões de criação, disponibilidade global dos nomes S3 ou publicação funcional.

## Antes de qualquer aplicação

AGENTS.md proíbe `terraform apply`. Em 2026-09-24, o usuário concedeu uma exceção
somente para uma execução do plano de 13 criações de `site/`, com zero alterações
ou exclusões, DNS de publicação desligado e sem upload. A autorização não inclui
bootstrap nem futuros applies. Não publicar um bucket vazio como se fosse a loja pronta.

Após bootstrap autorizado, configurar o backend de `site/` com bucket
`dililu-tfstate-320169806724`, key `site/production.tfstate`, region `us-east-1`,
`encrypt=true` e `use_lockfile=true`; inicializar/migrar e gerar um novo plano.
Nesta execução limitada, o estado de site permanece local em
`infra/site/terraform.tfstate`, com cópia em `.local/site-post-apply.tfstate`, ambos
ignorados no Git. Preservar esses arquivos: representam recursos reais; a cópia
no mesmo disco não substitui backup externo seguro. Não há backend S3 criado.
O estado do bootstrap, quando autorizado, precisará de backup privado e ciclo de vida independente.
Não aplicar planos locais antigos após alterar o backend.

Pendências para lançamento: aplicação M0–M7, identidade visual/fotos, CSP compatível
com o build, publicador de rotas estáticas, CI e role OIDC restrita ao repositório
GitHub ainda não informado. M8/M9 não estão concluídos por este preparo.
