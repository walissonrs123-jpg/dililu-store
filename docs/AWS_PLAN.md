# Plano de configuração AWS — Dililu V1.1

Data: 2026-09-24. Estado: plano original; as 13 criações de site foram posteriormente aplicadas sob autorização excepcional, conforme `docs/AWS_VALIDATION.md`. Bootstrap e publicação não executados. Futuros applies exigem nova autorização.

## Contexto e objetivo

O repositório contém a especificação e os exemplos; o STATUS permanece em M0 bloqueado. O site será Next.js estático, com catálogo em código, carrinho em localStorage e pedidos por WhatsApp. Não precisa de servidor de aplicação nem banco. O calendário de Instagram e seus exports são internos e não entram na hospedagem.

Este documento antecipa o desenho de M8/M9, a pedido do usuário; não conclui esses marcos nem substitui as validações da aplicação.

## Endereço confirmado e DNS observado

- Endereço provisório confirmado pelo usuário: `https://dililu.sofbrasil.com.br`.
- Consulta DNS pública em 2026-09-24: `sofbrasil.com.br` usa os nameservers `ns-1653.awsdns-14.co.uk`, `ns-477.awsdns-59.com`, `ns-914.awsdns-50.net` e `ns-1325.awsdns-37.org`, indicando DNS no Route 53. A consulta a `dililu.sofbrasil.com.br` retornou NXDOMAIN naquele momento.
- Essa consulta não identifica a conta proprietária, o hosted zone ID ou as permissões disponíveis. Confirmar esses dados pelo inventário autenticado antes de mudanças.
- Plano preferido: referenciar a zona pública existente `sofbrasil.com.br` como data source e administrar somente os aliases A/AAAA de `dililu` e o CNAME de validação ACM necessário. Não assumir gerenciamento Terraform de toda a zona.
- Certificado e alias CloudFront: apenas `dililu.sofbrasil.com.br`; não incluir wildcard, domínio principal ou `www` sem necessidade. Base URL de metadata, canonical, sitemap e robots: `https://dililu.sofbrasil.com.br`.
- Não há necessidade prevista de comprar domínio ou criar outra zona. Se a zona estiver em outra conta, combinar acesso específico ou criação dos registros pelo responsável, sem migrar o DNS do domínio principal.

## Arquitetura proposta

```text
Visitante -> DNS Route 53 -> CloudFront (HTTPS / certificado ACM)
                                      -> OAC -> S3 privado (site)

GitHub Actions -> OIDC -> role IAM de deploy -> S3 + invalidação CloudFront
Terraform -> estado em outro bucket S3 privado, sem acesso pelo CloudFront
```

IAM é o suporte necessário à autenticação OIDC já prevista na arquitetura. Não adicionar EC2, banco, VPC, NAT, Lambda, API Gateway, WAF, Amplify ou integração Meta.

## Recursos e configurações

| Recurso | Configuração planejada |
| --- | --- |
| S3 do site | Região proposta `us-east-1`, nome global único derivado de projeto/conta/ambiente; Block Public Access completo; Bucket owner enforced; criptografia SSE-S3; versionamento; `force_destroy = false`. |
| Acesso à origem | Endpoint REST regional do S3, sem website hosting; OAC com assinatura sempre habilitada; bucket policy permite leitura ao CloudFront somente com o ARN da distribuição em `AWS:SourceArn`; exigir TLS. |
| CloudFront | HTTPS obrigatório, TLS mínimo 1.2, compressão, métodos GET/HEAD, `index.html` na raiz e página de erro `404.html`. Configurar 403/404 da origem como resposta 404, nunca como home com status 200. |
| Cache | Assets com hash: cache longo e immutable; HTML e respostas estáticas de navegação: cache curto/revalidação, com política de cache que permita TTL mínimo zero. Invalidar páginas alteradas após deploy. |
| Certificado ACM | Certificado público para os hosts escolhidos, em `us-east-1`, com validação DNS. Manter os registros de validação para renovação. |
| Route 53 | Reutilizar zona pública existente quando disponível; aliases A/AAAA para CloudFront. Não criar zona duplicada nem trocar nameservers sem inventariar os registros existentes. |
| Headers | Política de response headers com nosniff, Referrer-Policy, proteção contra framing e CSP validada com o build Next.js; adotar HSTS após confirmar HTTPS em todos os hosts envolvidos. |
| IAM/OIDC | Reutilizar provider GitHub existente, se houver; role exclusiva de publicação com permissões restritas ao bucket do site e à distribuição. |
| S3 de estado | Bucket separado, privado, criptografado e versionado; backend Terraform com `use_lockfile = true`, sem DynamoDB; proteção contra destruição. |

A região do S3 é uma proposta, não uma configuração aplicada. Comparar preços e eventuais requisitos de localização antes do provisionamento. O certificado do CloudFront precisa de `us-east-1` independentemente da região escolhida para o bucket.

## Contrato entre Next.js e hospedagem

- Usar `output: 'export'`, páginas de produtos pré-geradas e imagens compatíveis com export estático, sem depender de otimizador em servidor.
- Proposta: `trailingSlash: false`, URLs canônicas sem barra final e manifesto de publicação gerado a partir do build.
- O export de `/produtos/body` gera HTML; o publicador também envia esse HTML para a chave S3 `produtos/body`, com `Content-Type: text/html; charset=utf-8`. Preservar os arquivos exportados e os payloads de navegação exigidos pelo Next.js.
- Para aceitar acesso com barra final, publicar também a chave exata `produtos/body/` com o mesmo HTML e canonical sem barra. Essas chaves são objetos S3, não índices automáticos de diretório. Validar conflitos no manifesto.
- O default root object do CloudFront atende a raiz, não resolve índices de todas as subpastas. Não depender de fallback global para `index.html`.
- Testar acesso direto, reload, navegação interna e retorno 404 para rota inexistente antes de aprovar o contrato de publicação.
- Publicar exclusivamente o artefato derivado de `out/`. Nunca sincronizar a raiz do repositório. Rejeitar `docs/`, `content/`, credenciais, `.env*`, `awsTemp`, estados e planos Terraform no artefato público.

## Terraform e autenticação

Estrutura futura:

```text
infra/bootstrap/       # bucket de estado; ciclo de vida independente
infra/site/            # S3, OAC, CloudFront, ACM, DNS e role de deploy
scripts/              # validação do artefato e publicação pelo manifesto
.github/workflows/    # CI e publicação controlada
```

Fixar versões compatíveis de Terraform/providers e versionar o lockfile. Antes do backend existir, preparar e validar o bootstrap localmente; sua criação e a migração do estado ficam para uma execução autorizada posterior. Não versionar state, tfvars privados nem arquivos de plano.

Para acesso humano, preferir perfil AWS com sessão temporária. Não usar credenciais root nem copiar chaves para arquivos do projeto. A identificação da conta e o inventário inicial serão somente leitura quando houver um perfil disponível.

No GitHub, usar `id-token: write`, `contents: read`, audiência `sts.amazonaws.com` e `sub` restrito a `repo:OWNER/REPO:environment:production`. Restringir esse environment à branch de publicação. Conferir disponibilidade das proteções no plano GitHub antes de depender delas. Não confiar em qualquer repositório ou pull request.

A role de deploy poderá listar o bucket, publicar/ler objetos necessários e invalidar somente a distribuição do site. Não poderá alterar IAM, DNS ou acessar o estado Terraform. Permissões de exclusão só serão adicionadas se o mecanismo de remoção de páginas exigir; não usar limpeza ampla durante o primeiro deploy. Infraestrutura terá identidade separada da publicação.

## Sequência de execução futura

1. Confirmar conta, perfil, domínio, zona DNS existente, região, repositório e teto de custo. Inventariar recursos para decidir reutilização/importação, sem mudanças.
2. Concluir M0–M7 e gerar build estático validado. Recuperar logo e fotos oficiais antes do lançamento.
3. Implementar Terraform em M8; executar `fmt -check`, `init -backend=false` e `validate`. Gerar `plan` autenticado quando os pré-requisitos estiverem disponíveis; registrar bloqueios reais. Um plano não cria recursos, mas seu refresh consulta a AWS.
4. Apresentar plano concreto, recursos existentes afetados e estimativa de custo. Este trabalho não autoriza nem executa apply, registro de domínio ou mudança de DNS.
5. Após provisionamento autorizado em etapa posterior, validar primeiro pelo hostname CloudFront. Associar certificado e publicar DNS somente com o site aprovado. Preservar MX, TXT e demais registros do domínio.
6. CI: lint, typecheck, testes e export; validar lista de arquivos permitidos. Deploy serializado: assets primeiro, páginas depois, invalidação ao final; actions fixadas por SHA.
7. Guardar artefato/manifesto da release anterior para rollback. Não apagar imediatamente assets com hash da release anterior; planejar retenção limitada. Restaurar o artefato anterior e invalidar HTML em caso de falha.

## Critérios de aceite

- S3 direto inacessível publicamente; CloudFront entrega o site por HTTPS.
- Produto, catálogo, carrinho e institucionais abrem diretamente e após reload; rota inexistente retorna 404 real.
- Carrinho persiste e mensagem de WhatsApp mantém os dados comerciais confirmados.
- Nenhum conteúdo de `docs/`, `content/` ou arquivos locais sensíveis no artefato ou bucket público via CloudFront.
- Role de deploy restrita à identidade GitHub definida; nenhuma chave duradoura no pipeline.
- Nenhum recurso fora da lista permitida no plano; nenhuma destruição inesperada.
- DNS preserva registros existentes; certificado válido; rollback documentado e testado quando houver ambiente.

## Custos e informações pendentes

Não há estimativa monetária fechada: faltam domínio, tráfego, tamanho das fotos, frequência de deploy e dados da conta. Não assumir gratuidade. Calcular S3 (armazenamento, requests e versões), CloudFront (modalidade, tráfego, requests e invalidações), Route 53 (zona e consultas), domínio e eventual consumo de GitHub Actions. Confirmar condições do certificado escolhido. Avaliar lifecycle para versões antigas e retenção de releases antes de ativar, sem excluir material existente agora.

Pendências para implementação: responsável e acesso à zona de `sofbrasil.com.br`; conta/perfil AWS; região; OWNER/REPO e branch; hosted zone ID; orçamento mensal e estimativa de visitas/mídia. Esses dados não impedem o planejamento, mas impedem um plano Terraform de produção completamente resolvido.

## Referências oficiais consultadas

- [S3 privado e OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Certificado ACM para CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)
- [Limites do default root object](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DefaultRootObject.html)
- [Next.js static export](https://nextjs.org/docs/app/guides/static-exports)
- [IAM e GitHub Actions OIDC](https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/)
- [Backend S3 e lockfile Terraform](https://developer.hashicorp.com/terraform/language/backend/s3)
- [Preços Route 53](https://aws.amazon.com/route53/pricing/)
