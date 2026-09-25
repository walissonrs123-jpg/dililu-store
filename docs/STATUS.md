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
M9 parcial: aguardar OWNER/REPO real — `SEU_USUARIO/dililu-store` é placeholder. Push foi autorizado, mas remote/push não foram executados sem destino válido. OIDC verificado somente nos arquivos locais: nenhum ARN de role configurado. Role/políticas necessárias em `docs/LOCAL_SECURITY.md`; não criar IAM.

## Último marco concluído
- M1–M7 implementados e commitados separadamente. M7: calendário de sete itens, templates Feed/Story/Reel, validação e export Markdown/CSV; agendamento manual.
- Último `npm run verify`: lint (incluindo scripts), typecheck, testes 15/15 e build/export estático PASS. Sintaxe PowerShell e proteção/leitura DPAPI PASS. Sem ler/varrer `out/` e sem upload.
- M8 concluído com as evidências já registradas: 13 criados, 0 alterados, 0 excluídos. Nenhuma nova consulta AWS, plan ou apply nesta etapa.
- CI revisado: actions fixadas por SHA, permissões de leitura, sem deploy e verificação de exports desatualizados. Testes aceitam fotos reais locais e barram backups Terraform em public. CI remoto ainda não executado.
- CSP base aplicada via meta no layout, com exceções inline necessárias ao export estático; sem eval em produção. CSP estrita por hashes/cabeçalho e testes em navegador/entrega continuam pendentes, conforme `docs/LOCAL_SECURITY.md`.
- Cópia da credencial protegida por DPAPI em `.local/aws-credentials.dpapi`; script de acesso prefere essa cópia. `awsTemp` original preservado em texto, ambos ignorados pelo Git. Nenhuma chamada AWS executada.

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
- GitHub informado com OWNER placeholder; aguardando identificação real para remote/push. Não foi encontrado ARN OIDC local; nenhuma existência de role AWS foi presumida. Mídias oficiais ausentes nas pastas previstas. IAM, upload, invalidação e DNS continuam sem autorização.





