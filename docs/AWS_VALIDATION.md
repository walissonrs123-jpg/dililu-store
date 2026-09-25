# Validação AWS — 2026-09-24

## Provisionamento autorizado — concluído

Em 2026-09-24, o usuário autorizou uma única execução de apply, exclusivamente
para as 13 criações do plano de `infra/site/`, mantendo DNS de publicação
desativado e sem alterar/excluir recursos existentes. Essa exceção foi consumida;
a proibição de AGENTS.md permanece para futuros applies. Bootstrap não aplicado.

### Plano e execução

- Novo `terraform plan -out=...` gerado imediatamente antes do apply, seguido de `terraform show`.
- Resultado confirmado: **Plan: 13 to add, 0 to change, 0 to destroy.**
- Comparação integral dos 13 resource_changes com o plano anteriormente validado: idênticos; apenas create; `publish_dns=false`; único registro DNS previsto é o CNAME de validação ACM.
- Plano aplicado: `.local/site-approved.tfplan`.
- SHA-256: `1DEA72C40C5C5632B0CD9F939237A65A2197CB89EDE486558F10A1342127F2BF`.
- Resultado: **Apply complete! Resources: 13 added, 0 changed, 0 destroyed.** Exit code: **0**.
- Conferência independente por leituras AWS concluída em **2026-09-24 14:44:06 UTC**.

### Recursos provisionados

| Endereço Terraform | ID / ARN não sensível |
| --- | --- |
| `aws_s3_bucket.site` | `arn:aws:s3:::dililu-site-320169806724-prod` |
| `aws_s3_bucket_public_access_block.site` | `dililu-site-320169806724-prod` |
| `aws_s3_bucket_ownership_controls.site` | `dililu-site-320169806724-prod` |
| `aws_s3_bucket_server_side_encryption_configuration.site` | `dililu-site-320169806724-prod` |
| `aws_s3_bucket_versioning.site` | `dililu-site-320169806724-prod` |
| `aws_s3_bucket_policy.site` | `dililu-site-320169806724-prod` |
| `aws_acm_certificate.site[0]` | `arn:aws:acm:us-east-1:320169806724:certificate/874b96c4-135d-4715-a3f2-7f924f50b605` |
| `aws_acm_certificate_validation.site[0]` | `2026-09-24 14:40:22.38 +0000 UTC` |
| `aws_route53_record.validation["dililu.sofbrasil.com.br"]` | `Z0676301JLBSS7IFN575__19cd223c682705b860c9523fb913e5e3.dililu.sofbrasil.com.br._CNAME` |
| `aws_cloudfront_distribution.site` | `arn:aws:cloudfront::320169806724:distribution/E1EZ9JK9Q7UT7V` |
| `aws_cloudfront_origin_access_control.site` | `arn:aws:cloudfront::320169806724:origin-access-control/E1VSBGSP7OK1W3` |
| `aws_cloudfront_cache_policy.site` | `arn:aws:cloudfront::320169806724:cache-policy/1e181103-724a-40af-926b-f425656eb51f` |
| `aws_cloudfront_response_headers_policy.site` | `arn:aws:cloudfront::320169806724:response-headers-policy/17092bc7-f5f1-4164-88ca-802fdd06ca27` |

### Outputs e conferência final

- Bucket: `dililu-site-320169806724-prod`.
- CloudFront: `deagwveviqeg7.cloudfront.net`; ID `E1EZ9JK9Q7UT7V`; status **Deployed**.
- Certificado para `dililu.sofbrasil.com.br`: **ISSUED**.
- URL prevista: `https://dililu.sofbrasil.com.br` — **ainda não publicada**.
- S3: quatro opções de Block Public Access ativas, `IsPublic=false`, criptografia AES256, versionamento Enabled, BucketOwnerEnforced e **zero objetos**.
- DNS: **zero registros** no nome exato `dililu.sofbrasil.com.br`; todos os registros preexistentes comparados e preservados. Apenas um CNAME de validação ACM foi adicionado.
- Nenhum upload, site fictício, bootstrap, role IAM ou recurso adicional criado nesta execução.

Estado local: `infra/site/terraform.tfstate`; cópia: `.local/site-post-apply.tfstate`.
Ambos ignorados no Git e devem ser preservados. Não existe backend remoto criado;
backup no mesmo disco não protege contra perda da máquina. Evidências locais:
`.local/site-approved-show.txt`, `.local/site-apply.log`, `.local/site-apply-exit.txt`
e `.local/site-verification.json`. Não contêm credenciais exibidas pelo processo.

Próxima etapa: build do site, testes, upload autorizado e validação CloudFront;
somente depois, com nova autorização, ativar o domínio. M8/M9 continuam parciais
por dependências de aplicação, publicação, CSP e CI/OIDC.

---

As seções abaixo preservam o histórico de preparação anterior à autorização e ao apply.

## Acesso e inventário

- Autenticação HTTPS via AWS CLI oficial: conta `320169806724`, identidade `arn:aws:iam::320169806724:user/walissonrs` (não root).
- Credencial lida de `awsTemp`, sem impressão, sem argumentos contendo segredo e sem gravação em perfil global. Variáveis do processo restauradas ao encerrar. Arquivo original preservado e ignorado no Git; isso não equivale a criptografar o arquivo.
- Zona pública `sofbrasil.com.br`: `Z0676301JLBSS7IFN575`. Nameservers coincidem com o DNS público consultado.
- Não encontrado registro exato `dililu.sofbrasil.com.br` nem distribuição com esse alias. Nenhum bucket com nome correspondente a `dililu`, `terraform` ou `tfstate` encontrado na listagem; isso não exclui buckets de estado com outros nomes nem garante disponibilidade global do nome proposto.
- ACM em us-east-1: certificados emitidos para `sofbrasil.com.br`/`www.sofbrasil.com.br` e `test.sofbrasil.com.br`; nenhum cobre o subdomínio Dililu. Permanecem inalterados.
- Leituras de STS, Route 53, S3, CloudFront e ACM concluídas. Não houve auditoria de todas as permissões IAM; sucesso no plan não comprova permissão para criar recursos.

## Ferramentas e validações

- AWS CLI 2.37.1 extraída localmente após assinatura Authenticode válida da Amazon.
- Terraform 1.16.4 extraído localmente após checksum SHA-256 comparado ao publicado pela HashiCorp via HTTPS.
- Provider AWS 6.66.0 baixado do Registry com assinatura HashiCorp; lockfiles versionáveis presentes. Bootstrap reutilizou o pacote local e o mesmo lockfile.
- Parser PowerShell: script sem erros sintáticos.
- `terraform fmt -check -recursive infra`: passou.
- `terraform validate`: passou em bootstrap e site.
- `terraform plan` autenticado: passou nos dois conjuntos.
- Auditoria dos planos JSON: somente criações de tipos permitidos; nenhum registro de publicação A/AAAA; nenhum recurso existente alterado ou excluído.

| Conjunto | Criar | Alterar | Excluir |
| --- | ---: | ---: | ---: |
| bootstrap | 6 | 0 | 0 |
| site | 13 | 0 | 0 |

As contagens são endereços de recursos Terraform, incluindo configurações de bucket e validação de certificado, não 19 serviços independentes.

## Resultado concreto e limitações

Código em `infra/`; planos binários em `.local/bootstrap.tfplan` e `.local/site.tfplan`, ignorados no Git. O plano principal inclui certificado ACM, CNAME de validação, S3 privado, OAC, políticas de cache/headers e CloudFront. O bootstrap inclui o bucket privado de estado e suas proteções.

Nenhum apply, upload ou alteração de DNS executado. O usuário solicitou iniciar a subida, mas AGENTS.md contém a proibição expressa de `terraform apply`; resolver essa restrição explicitamente antes de provisionar. Não contornar via CLI.

O repositório ainda não possui aplicação nem build estático. Para publicar a loja, concluir M0–M7, artefato, headers CSP e publicador, depois CI/OIDC. Não foi criado site fictício para aparentar conclusão. Não houve commit: Git continua ausente no PATH e nenhum marco foi fechado.

## Custos para a revisão anterior ao provisionamento

Configuração proposta por consumo, sem contratação de plano CloudFront de preço fixo. Reutilização da zona existente evita uma nova zona; não haverá compra de domínio. Certificado público ACM não exportável usado com CloudFront segue as condições de gratuidade do ACM; S3 e uso CloudFront continuam sujeitos a cobrança e franquias da conta. Não se presume saldo disponível de franquia.

Ainda não há orçamento mensal aprovado ou tráfego/mídia estimados. A estimativa deve considerar tamanho de arquivos e versões S3, requests, transferência CloudFront e invalidações. Nenhuma promessa de custo zero ou teto automático foi feita.

Fontes: [ACM](https://aws.amazon.com/certificate-manager/pricing/), [S3](https://aws.amazon.com/s3/pricing/), [CloudFront](https://aws.amazon.com/cloudfront/pricing/), [Route 53](https://aws.amazon.com/route53/pricing/).

## Publicação autorizada — 2026-09-25
- Workflow https://github.com/walissonrs123-jpg/dililu-store/actions/runs/36167487484, commit 45d80cbf49274c0123c81b9997f6da9479f3da18: build, OIDC, upload, invalidação e testes PASS.
- Role arn:aws:iam::320169806724:role/dililu-github-deploy; bucket dililu-site-320169806724-prod: 119 objetos enviados, zero exclusões.
- Distribuição E1EZ9JK9Q7UT7V; invalidação I5V10TZAG2Q9XQ9PMDI7KI8DI0 concluída. URL https://deagwveviqeg7.cloudfront.net.
- Home, catálogo, produto, tamanho, carrinho/persistência, WhatsApp, logo/placeholders, rotas diretas e mobile: PASS em Chromium 1440px/390px.
- DNS permanece desativado; IAM/OIDC, Terraform e infraestrutura não alterados. Validação limitada aos fluxos e navegadores descritos.
