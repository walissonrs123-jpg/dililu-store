# Admin — preparação local

Atualização 2026-09-27: infraestrutura aplicada mediante autorização direta (18 criações, zero alterações/exclusões). Seed de 80 produtos e API validados; convite administrativo enviado, primeiro acesso pendente. Outputs públicos e evidências em STATUS.md; nenhuma senha/tokens versionados. Publicação frontend ainda pendente neste registro.

Seed no Windows fixa [AWS_CLI_FILE_ENCODING=UTF-8](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) para preservar acentos. Onze nomes da carga inicial foram restaurados com condições de versão/valor, sem mudança de preço ou estoque; a comparação integral pela API passou.

Nenhuma alteração AWS, seed ou publicação autorizada nesta etapa. `/admin` contém somente uma tela de login pública; dados e edição exigem token Cognito e grupo `dililu-admin`. Login público/cadastro desabilitados. Authorization Code + PKCE S256; token de acesso apenas em memória, validade 15 minutos. Logout encerra a sessão local/Hosted UI; JWT já emitido pode permanecer válido até expirar.

Infra proposta em `infra/admin/`, estado separado: Cognito Lite (pool, cliente sem secret, domínio de login, grupo), HTTP API com JWT, Lambda Node 24, DynamoDB `DililuProducts` sob demanda, logs por sete dias e role restrita à tabela/logs. Sem GSI, servidores, alterações no site/S3/CloudFront/DNS ou na role de deploy. SDK v3 fornecido pelo runtime Lambda; validar integração real após autorização. Recursos cobram conforme uso; não estimamos gratuidade garantida.

Rotas: GET `/products`, GET `/products/{id}` públicas; GET `/admin/products` e PUT `/admin/products/{id}` exigem JWT + grupo. Não há criação/exclusão de produtos. PUT usa versão condicional para impedir sobrescrita concorrente. Imagem, slug e ID imutáveis; referência comercial editável. Produtos ocultos não retornam nas rotas públicas. Estoque zero gera ESGOTADO sem exclusão.

Migração: `node scripts/seed-products.mjs` é dry-run sem AWS. Os 80 registros preservam os metadados. Estoque não fornecido usa `null` (a consultar), não quantidades inventadas. Só tamanhos escolhidos podem ser comprados; estoque conhecido limita o carrinho. WhatsApp não baixa estoque. O administrador precisa informar as quantidades reais para controle completo.

Proposta de preço (não aplicada): 10 shorts infantis → R$ 19,90. Conjuntos: zero alterações; os 30 femininos/10 masculinos não identificam Jennynha nos metadados. Precisam de confirmação da marca. `--approved-prices` só poderá ser usado depois da aprovação específica; seed padrão conserva todos os preços. Registros existentes sempre são ignorados pelo seed, inclusive preços e estoque editados.

Próxima etapa, somente autorizada:
1. Confirmar inexistência/equivalência dos recursos propostos e revisar plano Terraform isolado, custos e permissões de implantação. Não foi feita consulta AWS nesta etapa.
2. Aplicar apenas o plano aprovado; obter outputs. Criar/invitar o administrador e adicioná-lo ao grupo, fora do Terraform (sem senha no estado/Git). Falta informar o e-mail do administrador.
3. Revisar dry-run; autorizar seed na conta/tabela exatas. Execução requer `DILILU_SEED_AUTHORIZED=320169806724/DililuProducts` e `--execute`; permissões temporárias `dynamodb:PutItem` somente nessa tabela. Não ampliar a role de publicação do site. Seed condicional não sobrescreve registros.
4. Informar quantidades reais pelo painel após implantação. Configurar três valores públicos de `.env.example` com outputs, testar autenticação/JWT e API reais antes de habilitar a loja dinâmica. Configurar os mesmos valores no build GitHub; workflow de produção ainda não foi alterado.
5. Build/export, publicação do site e invalidação requerem autorização. `/admin` é exportado como as demais rotas. A loja sem API configurada usa o catálogo original; com API configurada falha de rede bloqueia compra com aviso em vez de usar estoque antigo. Revalida ao focar a aba, a cada 30s, ao adicionar e antes do WhatsApp. Checkout não é transação/reserva; atendimento confirma a compra.

Limites: metadados SEO/URLs continuam estáticos; alterações de nome não alteram slug. Não há novos produtos nesta versão. Remoção de acesso JWT pode levar até 15 minutos. Testes locais usam API/Cognito simulados; não equivalem a validar a conta AWS.

Referências: [Cognito PKCE](https://docs.aws.amazon.com/cognito/latest/developerguide/using-pkce-in-authorization-code.html), [Lambda Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html).

Teste local sem AWS: gerar export com `NEXT_PUBLIC_CATALOG_API_URL=https://dililu-api.test`, `NEXT_PUBLIC_COGNITO_DOMAIN=https://dililu-auth.test`, `NEXT_PUBLIC_COGNITO_CLIENT_ID=local-test-client`; executar `npm run test:admin` com `PLAYWRIGHT_ROOT` apontando para instalação local do Playwright e, opcionalmente, `BROWSER_CHANNEL=msedge`. O teste usa porta 4173 e intercepta autenticação/API. Esse artefato é somente de teste; removendo essas variáveis e reconstruindo volta ao modo estático. Não publicar artefato com endpoints `.test`.
