# Segurança local — M9

## Credencial AWS
- Cópia protegida por DPAPI em `.local/aws-credentials.dpapi`, vinculada ao usuário Windows desta máquina e ignorada pelo Git. Proteção e leitura de volta validadas sem chamadas AWS.
- `Test-AwsAccess.ps1` prefere essa cópia, descriptografa somente no processo e restaura as variáveis de ambiente ao terminar. O script de consulta não cria roles; a configuração OIDC autorizada está registrada abaixo.
- Atualização da cópia: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/Protect-AwsCredential.ps1`, sob o perfil Windows original. O arquivo `awsTemp` original foi preservado e continua em texto; não foi removido automaticamente. Não versionar, compartilhar ou publicar nenhum dos dois arquivos.

## OIDC configurado
- Provider criado: `arn:aws:iam::320169806724:oidc-provider/token.actions.githubusercontent.com`, audiência `sts.amazonaws.com`.
- Role criada: `arn:aws:iam::320169806724:role/dililu-github-deploy`.
- Trust exata em [iam/dililu-trust.json](iam/dililu-trust.json): somente `repo:walissonrs123-jpg/dililu-store:ref:refs/heads/main`, sem environment no job.
- Policy inline `dililu-publish` em [iam/dililu-publish.json](iam/dililu-publish.json): somente `s3:ListBucket` no bucket Dililu, `s3:PutObject` nos objetos e `cloudfront:CreateInvalidation` na distribuição Dililu. Sem outras policies anexadas.
- Criação autorizada nesta execução; leitura de confirmação da trust e permissões PASS. Nenhuma ampliação, exclusão, publicação, invalidação, alteração DNS ou Terraform.
- `.github/workflows/deploy.yml`: somente disparo manual na main, autenticação OIDC e confirmação de identidade; permissões `contents: read` e `id-token: write`. Action fixada no SHA oficial da v5.1.1. Nenhum segredo permanente no GitHub.
- Workflow remoto ainda não disparado; autenticação ponta a ponta pendente. Publicador e ativação do domínio exigem autorização separada.
- Referências: [AWS provider OIDC](https://docs.aws.amazon.com/cli/latest/reference/iam/create-open-id-connect-provider.html), [action oficial](https://github.com/aws-actions/configure-aws-credentials/tree/61815dcd50bd041e203e49132bacad1fd04d2708).
## CSP do export estático
CSP aplicada localmente via meta em `src/app/layout.tsx`: recursos próprios, sem plugins/frames/formulários externos/handlers inline, sem eval em produção. Não depende de headers de servidor Next nem altera CloudFront.

Scripts e estilos inline ainda são permitidos para hidratação do export Next.js; essa política base não equivale a uma CSP estrita contra injeção de script. Nonce fixo não é usado. Hashes por build e `frame-ancestors` via cabeçalho HTTP ficam para a etapa de publicador/entrega autorizada; `frame-ancestors` não funciona em meta. A proteção de framing da infraestrutura existente não foi alterada ou consultada.

Build e testes de política não substituem validação em navegador. Referências: [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).
