# Publicação — pendente de autorização

CI preparado em `.github/workflows/ci.yml`: Node 24, instalação pelo lockfile,
lint/tipos/testes/build e planner. Sem credenciais AWS, upload ou alteração DNS.
A execução remota depende do repositório GitHub ainda não informado.

Antes de publicar: adicionar logo/fotos reais e revisar o catálogo; testar
responsividade e fluxo de carrinho em navegador; definir OWNER/REPO e role OIDC
restrita ao environment de produção. A criação da role não está autorizada pelo
apply anterior, limitado às 13 criações já realizadas.

Com autorização específica futura, implementar o publicador descrito em
`AWS_PLAN.md`: somente export estático, manifesto de rotas sem extensão e variantes
com barra, Content-Type correto, assets antes do HTML e invalidação controlada.
Nunca sincronizar a raiz, `docs/`, `content/`, `awsTemp` ou estados Terraform.
Preservar artefato anterior para rollback e testar acesso direto/404 no CloudFront.

Bucket: `dililu-site-320169806724-prod`.
Distribuição: `E1EZ9JK9Q7UT7V` (`deagwveviqeg7.cloudfront.net`).
Ativar `dililu.sofbrasil.com.br` somente após validação e nova autorização.
Estado Terraform continua local; preservar arquivos já registrados em AWS_VALIDATION.

M9 não concluído: CI remoto, OIDC, CSP validada em navegador, publicador e aprovação
de lançamento continuam pendentes. Nenhuma publicação executada nesta etapa.
