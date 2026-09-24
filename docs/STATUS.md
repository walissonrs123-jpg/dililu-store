# STATUS — Dililu Store V1.1
- Projeto: Catálogo + WhatsApp + Planejamento Instagram gratuito
- Marco atual: M2
- Estado: IN_PROGRESS

## Marcos
- [x] M0 Bootstrap
- [x] M1 Design system
- [ ] M2 Catálogo
- [ ] M3 Home
- [ ] M4 Produto
- [ ] M5 Carrinho + WhatsApp
- [ ] M6 Institucional + SEO
- [ ] M7 Planejamento Instagram
- [ ] M8 Infra AWS
- [ ] M9 CI/CD + fechamento

## Próxima ação
M2: modelo, dados confirmados, cards e filtros do catálogo. Logo e fotos oficiais pendentes para apresentação final.

## Último marco concluído
- M1: tokens, componentes reutilizáveis, header/footer responsivos, navegação por teclado, redução de movimento e 404. Nome textual; paleta provisória, sem simular logo oficial.
- `npm run verify`: lint PASS, typecheck PASS, testes 2/2 PASS, build estático PASS. Nenhum upload.

## Execução econômica
- Leituras restritas ao marco atual; validação em lote no fechamento. Sem novas consultas AWS nem plan/apply: resultado final já confirmado.
- M8/AWS: **13 recursos criados, 0 alterados, 0 excluídos**. DNS de publicação desativado; site não publicado. Infra provisionada; integração e fechamento dependem da aplicação.

## Planejamento AWS
- Em 2026-09-24, arquitetura, publicação estática, OIDC, estado Terraform, custos e critérios de aceite detalhados em `docs/AWS_PLAN.md`, a pedido do usuário.
- Acesso AWS validado em 2026-09-24 na conta `320169806724`, via usuário IAM `walissonrs`; zona `Z0676301JLBSS7IFN575` confirmada. Apply excepcional autorizado concluído: 13 criados, 0 alterados, 0 excluídos. M8/M9 permanecem parciais.
- Domínio provisório confirmado: `dililu.sofbrasil.com.br`. Consulta DNS pública indica Route 53 para a zona principal; subdomínio retornou NXDOMAIN em 2026-09-24.
- Infraestrutura preparada em `infra/bootstrap/` e `infra/site/`. Formatação, validação e planos autenticados passaram: 6 + 13 criações, zero alterações/exclusões. Planos em `.local/`, ignorados no Git. DNS de publicação desabilitado por padrão.
- AWS CLI 2.37.1 e Terraform 1.16.4 disponíveis localmente em `.tools/`; provider AWS 6.66.0 fixado nos lockfiles. `awsTemp` ignorado no Git; credenciais usadas somente no ambiente do processo, sem exposição nos logs.
- Provisionado somente `infra/site/`: S3 privado e vazio, CloudFront `E1EZ9JK9Q7UT7V` Deployed, ACM ISSUED. DNS de publicação ausente e registros preexistentes preservados; único registro novo é a validação ACM. Sem upload.
- Bootstrap não aplicado. Estado local em `infra/site/terraform.tfstate`, com cópia `.local/site-post-apply.tfstate`. Preservar ambos; ignorados no Git.
- Autorização de apply consumida nesta execução; futuros applies continuam proibidos sem nova autorização. Pendências: aplicação/build, publicação, CSP, repositório GitHub e OIDC. Evidências e IDs em `docs/AWS_VALIDATION.md`.

## Bloqueios
- Bloqueio de ferramentas resolvido: Node.js/npm e Git locais, sem instalação global.
- Logo oficial e fotos reais ainda não foram fornecidas. As pastas `public/brand/` e `public/products/` estão preparadas; não substituir os materiais oficiais por imagens inventadas.
