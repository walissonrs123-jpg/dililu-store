# Fluxo de conteúdo Instagram

## Ferramenta local
- Execute `npm run content:plan` para gerar `content/exports/week-01.md` e `.csv` a partir de `content/calendar/week-01.json`.
- Outro calendário: `npm run content:plan -- content/calendar/arquivo.json`.
- Templates Feed/Story/Reel em `content/templates/default.json`; horários em America/Sao_Paulo. Preços vêm do catálogo; referências, datas, horários, formatos e status são validados.
- Revisar mídias reais antes de mudar `planned` para `ready`. CSV é uma referência para copiar manualmente, não integração/importação automática no Meta.
- Nenhum arquivo de `content/` é rota pública, e o exportador não agenda nem publica.

## Cadência inicial
- Feed/Reel: 3 a 4 vezes por semana.
- Stories: quase diariamente.
- Sem impulsionamento pago na V1.1.

## Exemplo semanal
- Segunda: Story Body M Baby — peça, tecido, preço, tamanhos.
- Terça: Feed Body + Short M Baby — criança usando, CTA WhatsApp.
- Quarta: Stories Vestidos — variedade/enquete/preço.
- Quinta: Feed Jennynha — masculino + feminino; cinto/bolsinha no feminino.
- Sexta: Stories novidades — mix + CTA.
- Sábado: Reel mix de produtos.
- Domingo: Story leve — enquete, reposição ou bastidor.

## Operação
1. revisar calendário;
2. selecionar fotos;
3. gerar Markdown/CSV;
4. abrir Meta Business Suite;
5. copiar legenda e mídia;
6. agendar;
7. marcar `scheduled`;
8. depois, marcar `published`.
