# Segurança local — M9

## Credencial AWS
- Cópia protegida por DPAPI em `.local/aws-credentials.dpapi`, vinculada ao usuário Windows desta máquina e ignorada pelo Git. Proteção e leitura de volta validadas sem chamadas AWS.
- `Test-AwsAccess.ps1` prefere essa cópia, descriptografa somente no processo e restaura as variáveis de ambiente ao terminar. Nenhuma role ou sessão AWS foi criada.
- Atualização da cópia: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/Protect-AwsCredential.ps1`, sob o perfil Windows original. O arquivo `awsTemp` original foi preservado e continua em texto; não foi removido automaticamente. Não versionar, compartilhar ou publicar nenhum dos dois arquivos.

## OIDC — configuração local ausente
Nenhum ARN de role de deploy foi encontrado na configuração/documentação local. Isso não informa se existe role na AWS; nenhuma consulta foi feita.

Role proposta, ainda não criada: `dililu-github-deploy` na conta `320169806724`.
- Provider OIDC esperado: `https://token.actions.githubusercontent.com`, audiência `sts.amazonaws.com`.
- Trust: somente `sts:AssumeRoleWithWebIdentity`; condições `aud=sts.amazonaws.com` e `sub=repo:OWNER/REPO:environment:production`, substituindo OWNER/REPO pelo destino real. Environment restrito a `main`.
- Bucket `arn:aws:s3:::dililu-site-320169806724-prod`: `s3:ListBucket`, `s3:GetBucketLocation`.
- Objetos `arn:aws:s3:::dililu-site-320169806724-prod/*`: `s3:GetObject`, `s3:PutObject`.
- Distribuição `arn:aws:cloudfront::320169806724:distribution/E1EZ9JK9Q7UT7V`: `cloudfront:GetDistribution`, `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation`.
- Sem permissões de exclusão, IAM, DNS, Terraform ou bucket de estado. Futuro job de deploy usará `id-token: write` e `contents: read`; CI atual continua somente leitura.

Criação/alteração de IAM exige autorização específica posterior. O GitHub informado como `SEU_USUARIO/dililu-store` permanece um placeholder, não um destino de push confirmado.

## CSP do export estático
CSP aplicada localmente via meta em `src/app/layout.tsx`: recursos próprios, sem plugins/frames/formulários externos/handlers inline, sem eval em produção. Não depende de headers de servidor Next nem altera CloudFront.

Scripts e estilos inline ainda são permitidos para hidratação do export Next.js; essa política base não equivale a uma CSP estrita contra injeção de script. Nonce fixo não é usado. Hashes por build e `frame-ancestors` via cabeçalho HTTP ficam para a etapa de publicador/entrega autorizada; `frame-ancestors` não funciona em meta. A proteção de framing da infraestrutura existente não foi alterada ou consultada.

Build e testes de política não substituem validação em navegador. Referências: [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).
