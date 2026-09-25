# STATUS — Dililu Store V1.1
- Projeto: Catálogo + WhatsApp + Planejamento Instagram gratuito
- Marco atual: M9
- Estado: COMPLETE

## Marcos
- [x] M0 Bootstrap
- [x] M1 Design system
- [x] M2 Catálogo
- [x] M3 Home
- [x] M4 Produto
- [x] M5 Carrinho + WhatsApp
- [x] M6 Institucional + SEO
- [x] M7 Planejamento Instagram
- [x] M8 Infra AWS
- [x] M9 CI/CD + fechamento

## Encerramento V1
V1 COMPLETE por solicitação do usuário. Domínio final: https://dililu.sofbrasil.com.br. Publicação: 2026-09-25. DNS, HTTPS, desktop/mobile, Home, catálogo, produto, carrinho e WhatsApp: PASS, conforme evidências já registradas. Encerramento documental, sem repetir testes/build ou alterar AWS/código. Fotos reais e melhorias adicionais de segurança/performance ficam como evolução posterior, sem bloquear a V1.

## Domínio publicado — 2026-09-25
- Hostname dililu.sofbrasil.com.br confirmado exatamente no alias CloudFront E1EZ9JK9Q7UT7V e certificado ACM ISSUED antes da mudança.
- Criados somente aliases A/AAAA previstos, zona Z0676301JLBSS7IFN575, destino deagwveviqeg7.cloudfront.net. Change C072936317K1C4M5CWAM0 INSYNC; todos os 8 registros preexistentes preservados por comparação integral.
- HTTPS e testes Chromium desktop/mobile pelo domínio PASS: Home, catálogo, produto/tamanho, carrinho/persistência e WhatsApp sem envio. Workflow https://github.com/walissonrs123-jpg/dililu-store/actions/runs/36168542083.
- Nenhuma alteração IAM/OIDC, S3, CloudFront ou Terraform. DNS criado via CLI autorizada; antes de futuro gerenciamento Terraform, reconciliar/importar os dois aliases com autorização própria. Nenhum import/plan/apply executado.

## Publicação CloudFront — 2026-09-25
- Build/export PASS do commit `45d80cbf49274c0123c81b9997f6da9479f3da18`; workflow [36167487484](https://github.com/walissonrs123-jpg/dililu-store/actions/runs/36167487484) PASS, exclusivamente via role OIDC dililu-github-deploy.
- 119 objetos publicados somente em dililu-site-320169806724-prod, sem exclusões. Assets antes de HTML; aliases de rotas sem extensão e com barra final; Content-Type e Cache-Control explícitos.
- Invalidação `I5V10TZAG2Q9XQ9PMDI7KI8DI0` da distribuição E1EZ9JK9Q7UT7V concluída; GetInvalidation usado somente para aguardar.
- Chromium desktop 1440px e mobile 390px PASS: Home, catálogo/filtro, produto, tamanho M, carrinho/quantidade/persistência, destino WhatsApp sem envio, logo/placeholders, rotas diretas e ausência de overflow/erros de console.
- Dois bloqueios locais do publicador corrigidos antes de qualquer upload: ignorar .gitkeep e reconhecer PNG Open Graph sem extensão. Nenhuma alteração na aplicação, IAM/OIDC, DNS, Terraform ou infraestrutura.
## Permissão de acompanhamento da invalidação
- Adicionado somente cloudfront:GetInvalidation à inline dililu-publish, restrito a arn:aws:cloudfront::320169806724:distribution/E1EZ9JK9Q7UT7V. Policy anterior conferida e resultado confirmado por leitura: PASS.
- Nenhuma mudança na trust, S3, DNS ou Terraform; nenhum deploy iniciado. Bloqueio de permissão resolvido; publicação e validação funcional concluídas na execução posterior acima.

## OIDC autorizado — 2026-09-25
- Provider GitHub criado; role dililu-github-deploy e única policy inline dililu-publish criadas. Trust main e as três permissões aprovadas confirmadas por leitura; zero policies gerenciadas anexadas.
- Workflow manual deploy.yml autenticou e confirmou a role dililu-github-deploy na conta 320169806724: PASS, run 36133208998, tentativa 2. Subject da trust corrigido para IDs imutáveis do GitHub; mesma main/repositório e permissões, única repetição autorizada. Sem upload, invalidação, DNS ou Terraform. Policies exatas versionadas em docs/iam/.
- Código da aplicação intacto; build/testes não repetidos. Commit com [skip ci] evita repetir o CI no push desta configuração.

## Último marco concluído
- M1–M7 implementados e commitados separadamente. M7: calendário de sete itens, templates Feed/Story/Reel, validação e export Markdown/CSV; agendamento manual.
- Integração da logo/placeholders: `npm run verify` executado uma única vez; lint, typecheck, testes 15/15 e build/export estático PASS. Sem ler/varrer `out/`, sem upload e sem alterações AWS/IAM/Terraform/DNS.
- M8 concluído com as evidências já registradas: 13 criados, 0 alterados, 0 excluídos. Nenhuma nova consulta AWS, plan ou apply nesta etapa.
- CI revisado: actions fixadas por SHA, permissões de leitura, sem deploy e verificação de exports desatualizados. Testes aceitam fotos reais locais e barram backups Terraform em public. CI remoto ainda não executado.
- CSP base aplicada via meta no layout, com exceções inline necessárias ao export estático; sem eval em produção. Testes funcionais em navegador/entrega concluídos; CSP estrita por hashes/cabeçalho permanece como melhoria futura, conforme `docs/LOCAL_SECURITY.md`.
- Cópia da credencial protegida por DPAPI em `.local/aws-credentials.dpapi`; script de acesso prefere essa cópia. `awsTemp` original preservado em texto, ambos ignorados pelo Git. Nenhuma chamada AWS executada.

## Execução econômica
- Leituras restritas ao marco atual; validação em lote no fechamento. Sem novas consultas AWS nem plan/apply: resultado final já confirmado.
- M8/AWS: **13 recursos criados, 0 alterados, 0 excluídos**. Provisionamento inicial preservado; publicação e ativação DNS posteriores concluídas conforme registros acima.

## Planejamento AWS
- Em 2026-09-24, arquitetura, publicação estática, OIDC, estado Terraform, custos e critérios de aceite detalhados em `docs/AWS_PLAN.md`, a pedido do usuário.
- Acesso AWS validado em 2026-09-24 na conta `320169806724`, via usuário IAM `walissonrs`; zona `Z0676301JLBSS7IFN575` confirmada. Apply excepcional autorizado concluído: 13 criados, 0 alterados, 0 excluídos. M9 concluído no encerramento da V1.
- Domínio provisório confirmado: `dililu.sofbrasil.com.br`. Consulta DNS pública indica Route 53 para a zona principal; subdomínio retornou NXDOMAIN em 2026-09-24.
- Infraestrutura preparada em `infra/bootstrap/` e `infra/site/`. Formatação, validação e planos autenticados passaram: 6 + 13 criações, zero alterações/exclusões. Planos em `.local/`, ignorados no Git. DNS de publicação desabilitado por padrão.
- AWS CLI 2.37.1 e Terraform 1.16.4 disponíveis localmente em `.tools/`; provider AWS 6.66.0 fixado nos lockfiles. `awsTemp` ignorado no Git; credenciais usadas somente no ambiente do processo, sem exposição nos logs.
- Provisionado somente `infra/site/`: S3 privado e vazio, CloudFront `E1EZ9JK9Q7UT7V` Deployed, ACM ISSUED. DNS de publicação ausente e registros preexistentes preservados; único registro novo é a validação ACM. Sem upload.
- Bootstrap não aplicado. Estado local em `infra/site/terraform.tfstate`, com cópia `.local/site-post-apply.tfstate`. Preservar ambos; ignorados no Git.
- Autorização de apply consumida na execução anterior; futuros applies continuam proibidos sem nova autorização. Build local confirmado; publicação e validação funcional concluídas; GitHub e IAM/OIDC configurados. Limitações da CSP documentadas para evolução posterior. Evidências AWS e IDs em `docs/AWS_VALIDATION.md`.

## Continuidade após a V1 (sem bloqueios de encerramento)
- Bloqueio de ferramentas resolvido: Node.js/npm e Git locais, sem instalação global.
- Logo oficial em `public/brand/logo-dililu.png`, preservada sem edição e usada no header/footer. Cards e detalhes usam placeholder com a marca e aviso explícito; nenhuma foto de produto gerada.
- Fotos reais pendentes: adicionar em `public/products/` e preencher `images` em `src/data/products.ts`, capa primeiro. Placeholder é substituído automaticamente; não inserir a logo como foto de produto.
- GitHub configurado: `walissonrs123-jpg/dililu-store`, main. Role OIDC criada: `arn:aws:iam::320169806724:role/dililu-github-deploy`. Upload/invalidação, DNS autorizado e validação pelo domínio final concluídos.





