# AGENTS.md — Dililu Store V1.1

## Missão
Construir a V1.1 da Dililu conforme `docs/PROJECT_SPEC.md`, `docs/ARCHITECTURE.md` e `docs/PLAN.md`.

## Continuidade
- Sempre leia `docs/STATUS.md` antes de começar e continue do próximo marco incompleto.
- Não peça confirmação para decisões locais, reversíveis e de baixo risco.
- Registre decisões relevantes em `docs/DECISIONS.md`.
- Ao concluir um marco: valide, atualize STATUS, faça commit focado e avance.
- Pare somente por credenciais/segredos, ação destrutiva, ativação paga ou requisito essencial ausente.

## Escopo
- Catálogo + carrinho + WhatsApp.
- Planejamento local de Feed/Story/Reel em `content/`.
- Agendamento manual pelo Meta Business Suite gratuito.
- Não criar checkout, login, painel admin web, Meta Graph API ou postagem automática.
- Não executar `terraform apply`.
- Não inventar preço, estoque, frete, promoção, avaliação ou política comercial.
- Não declarar envio nacional.
- Nunca publicar `content/` ou `docs/` como páginas do site.

## Stack
Next.js + TypeScript + Tailwind; catálogo em código; localStorage; wa.me; S3 + CloudFront + Route 53 + ACM; Terraform; GitHub Actions.

## Eficiência para Codex
- Consulte apenas os arquivos necessários ao marco atual.
- Não reescreva a especificação em prompts/comentários.
- Não faça refatorações fora do escopo.
- Rode validações completas no fechamento de cada marco, não a cada microalteração.
- Mantenha logs e explicações concisos.
