# STATUS — Dililu Store V1.1
- Projeto: Catálogo + WhatsApp + Planejamento Instagram gratuito
- Marco atual: M9
- Estado: BLOCKED

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
- [ ] M9 CI/CD + fechamento

## Próxima ação
M9 parcial: revisão local concluída em 2026-09-25. Dados externos e sequência de autorizações especificados em `docs/DEPLOY.md`. Aguardar URL GitHub/acesso, role OIDC ou autorização para criá-la e mídias oficiais. Sem consultas AWS, plan/apply, push, upload ou DNS.

## Último marco concluído
- M1–M7 implementados e commitados separadamente. M7: calendário de sete itens, templates Feed/Story/Reel, validação e export Markdown/CSV; agendamento manual.
- Lote de fechamento local M9: `npm run content:plan`, `npm run verify` e comparação dos exports versionados PASS. Lint (incluindo scripts), typecheck, testes 13/13 e build/export estático PASS. Sem ler/varrer `out/` e sem upload.
- M8 concluído com as evidências já registradas: 13 criados, 0 alterados, 0 excluídos. Nenhuma nova consulta AWS, plan ou apply nesta etapa.
- CI revisado: actions fixadas por SHA, permissões de leitura, sem deploy e verificação de exports desatualizados. Testes aceitam fotos reais locais e barram backups Terraform em public. CI remoto ainda não executado.
- Ainda faltam publicador de rotas estáticas, CSP e testes de navegador/entrega, além de CI remoto/OIDC e mídias finais. Esses itens não foram declarados concluídos pela validação de build.

## Execução econômica
- Leituras restritas ao marco atual; validação em lote no fechamento. Sem novas consultas AWS nem plan/apply: resultado final já confirmado.
- M8/AWS: **13 recursos criados, 0 alterados, 0 excluídos**. DNS de publicação desativado; site não publicado. Infra provisionada; integração e fechamento dependem da aplicação.

## Planejamento AWS
- Em 2026-09-24, arquitetura, publicação estática, OIDC, estado Terraform, custos e critérios de aceite detalhados em `docs/AWS_PLAN.md`, a pedido do usuário.
- Acesso AWS validado em 2026-09-24 na conta `320169806724`, via usuário IAM `walissonrs`; zona `Z0676301JLBSS7IFN575` confirmada. Apply excepcional autorizado concluído: 13 criados, 0 alterados, 0 excluídos. M9 permanece parcial.
- Domínio provisório confirmado: `dililu.sofbrasil.com.br`. Consulta DNS pública indica Route 53 para a zona principal; subdomínio retornou NXDOMAIN em 2026-09-24.
- Infraestrutura preparada em `infra/bootstrap/` e `infra/site/`. Formatação, validação e planos autenticados passaram: 6 + 13 criações, zero alterações/exclusões. Planos em `.local/`, ignorados no Git. DNS de publicação desabilitado por padrão.
- AWS CLI 2.37.1 e Terraform 1.16.4 disponíveis localmente em `.tools/`; provider AWS 6.66.0 fixado nos lockfiles. `awsTemp` ignorado no Git; credenciais usadas somente no ambiente do processo, sem exposição nos logs.
- Provisionado somente `infra/site/`: S3 privado e vazio, CloudFront `E1EZ9JK9Q7UT7V` Deployed, ACM ISSUED. DNS de publicação ausente e registros preexistentes preservados; único registro novo é a validação ACM. Sem upload.
- Bootstrap não aplicado. Estado local em `infra/site/terraform.tfstate`, com cópia `.local/site-post-apply.tfstate`. Preservar ambos; ignorados no Git.
- Autorização de apply consumida na execução anterior; futuros applies continuam proibidos sem nova autorização. Build local confirmado; publicação, CSP, repositório GitHub e OIDC pendentes. Evidências AWS e IDs em `docs/AWS_VALIDATION.md`.

## Bloqueios
- Bloqueio de ferramentas resolvido: Node.js/npm e Git locais, sem instalação global.
- Logo oficial e fotos reais ainda não foram fornecidas. As pastas `public/brand/` e `public/products/` estão preparadas; não substituir os materiais oficiais por imagens inventadas.
- Repositório GitHub não informado; CI remoto e configuração OIDC dependem dessa identificação. Futuros recursos AWS, upload e ativação DNS precisam de autorização específica.





