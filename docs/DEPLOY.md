# M9 — CI/CD e fechamento

## Situação local
- CI: PR, push em main e execução manual; somente contents: read, actions por SHA, Node 24, npm ci, lint/tipos/testes/build, planner e conferência dos exports versionados.
- Sem job de deploy, credenciais AWS no workflow, upload, push ou alteração DNS. CI remoto ainda não executado.
- Next.js usa output: export. Confirmar export pelo sucesso do build, sem ler/varrer out/.
- Fechamento local em 2026-09-25: lint/tipos, 13 testes, build/export e comparação dos exports do planner PASS. CI remoto e entrega via CloudFront não testados nesta etapa.
- M8 concluído: **13 criados, 0 alterados, 0 excluídos**. Sem consultas AWS ou Terraform nesta etapa.

## Dados externos necessários
1. URL GitHub (https://github.com/OWNER/REPO) e acesso autenticado de escrita na máquina. Defaults: branch main, environment production. Não enviar senha/token pelo chat.
2. ARN da role de deploy existente na conta 320169806724, compatível com OIDC desse repositório/environment; se não existir, informar isso e autorizar separadamente preparação/criação de provider/role. Fora das 13 criações anteriores.
3. Logo oficial em public/brand/; fotos reais em public/products/, associadas aos IDs body-mbaby, short-mbaby, vestido-infantil, conjunto-jennynha-masculino e conjunto-jennynha-feminino. Informar associação e ordem principal/galeria.
4. Aprovações distintas para push ao GitHub, IAM se necessário, upload/invalidação CloudFront e, após validação, DNS. Nenhuma dessas ações está autorizada agora.

Não reenviar credenciais AWS, domínio, conta, bucket ou distribuição: já registrados.

## Ações após as autorizações correspondentes
1. Integrar mídias; executar npm ci, npm run content:plan, npm run verify; testar responsividade, carrinho e acessibilidade em navegador.
2. Sem remote atual: git remote add origin <URL> e git push -u origin main; acompanhar CI. Enviar somente arquivos versionados, nunca credenciais/estados ignorados.
3. Validar/configurar OIDC: aud=sts.amazonaws.com e sub=repo:OWNER/REPO:environment:production, branch restrita e permissões limitadas ao bucket/distribuição. Preparar/revisar novo plano antes de qualquer criação IAM autorizada.
4. Implementar/testar publicador e CSP compatível com o build. Apenas artefato estático permitido; manifesto de rotas sem extensão/com barra, Content-Type correto, assets antes do HTML. Não sincronizar a raiz nem usar --delete. Guardar release anterior para rollback.
5. Com autorização de publicação, enviar ao bucket e executar aws cloudfront create-invalidation --distribution-id E1EZ9JK9Q7UT7V --paths "/*". Validar acesso direto, navegação, carrinho, HTTPS e 404 pelo CloudFront. DNS ainda desligado.
6. Com autorização separada de DNS, preparar/revisar aliases A/AAAA de dililu.sofbrasil.com.br, preservar os demais registros e executar a alteração aprovada. Futuros applies exigem autorização explícita.

Destino conhecido: s3://dililu-site-320169806724-prod; distribuição E1EZ9JK9Q7UT7V; hostname deagwveviqeg7.cloudfront.net.
Preservar estado Terraform local e backup conforme AWS_VALIDATION.md.

M9 parcial: faltam destino GitHub real, CI remoto, OIDC, mídia final, testes em navegador, publicador e validação de entrega. CSP base local implementada; limitações, proteção DPAPI e role/políticas necessárias em `LOCAL_SECURITY.md`. Push autorizado pelo usuário, mas o OWNER informado é placeholder; IAM, S3, invalidação e DNS continuam sem autorização.
