# Dililu Store — V1.1
Catálogo + carrinho + WhatsApp + planejamento local de Instagram, com AWS enxuta e Meta Business Suite gratuito.

## Começar no Codex
Primeira sessão: use `prompts/BOOTSTRAP_CODEX.md`.
Sessões seguintes: use `prompts/RESUME_CODEX.md`.

## Princípio
O site público não contém painel de marketing. O planejamento fica em `content/` e é exportado para Markdown/CSV; o agendamento é feito manualmente no Meta Business Suite.

Leia `INSTRUCOES_CODEX.md` para o passo a passo.

## Desenvolvimento local
Node.js 24 LTS. Nesta máquina, carregue as ferramentas locais no PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process Bypass
. ./scripts/Use-LocalTools.ps1
npm.cmd ci
npm.cmd run dev
```
Validação do marco: `npm.cmd run verify` (lint, tipos, testes e export estático).
Este comando não publica arquivos nem altera a AWS.
