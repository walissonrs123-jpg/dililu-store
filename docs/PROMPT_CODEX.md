# Prompt para o Codex — atualizar catálogo Dililu

Atualize o catálogo do site **Dililu** usando a nova estrutura de assets e o arquivo de dados deste pacote.

## Objetivo

Substituir a estrutura antiga de produtos pela nova organização em `public/products/` e usar `data/catalogo.json` como fonte principal do catálogo, preservando o visual atual do site e evitando regressões.

## Fonte de verdade

- Dados dos produtos: `data/catalogo.json`
- Imagens: `public/products/**`
- Mapeamento de caminhos antigos → novos: `data/assets-map.csv`
- Estrutura e contagens: `docs/ESTRUTURA.md`

## Regras obrigatórias

1. **Não invente produtos, preços, tamanhos disponíveis, estoque, frete, parcelamento ou políticas comerciais.**
2. Use exatamente os produtos presentes em `catalogo.json`.
3. Quando `price` for `null`, mostre **“Consulte o valor”**.
4. Quando houver preço, use `priceLabel` do JSON.
5. `sizesReference` é apenas faixa de referência. Exiba **“Consulte tamanhos disponíveis”** e não afirme que todos estão em estoque.
6. Atendimento: **Uberlândia/MG**.
7. Sobre entrega, use somente **“Entrega ou retirada a combinar”**.
8. CTA principal: `https://wa.me/5534996419677`.
9. Instagram: `@dililu.moda`.
10. Preserve a identidade visual Dililu: infantil, delicada e clean; branco/creme/rosa-claro predominantes, com detalhes pastel em lilás, azul-claro, verde-mint e amarelo.
11. Não altere, regenere, aplique filtros destrutivos ou recorte agressivamente as imagens dos produtos. O site deve apenas exibir os arquivos fornecidos.
12. Não infira licenciamento, autenticidade ou parceria oficial a partir de estampas, personagens, marcas ou textos visíveis nas roupas.

## Organização do catálogo

### Moda Bebê
- Bodies
- Shorts Bebê

### Moda Infantil
- Vestidos
- Shorts Infantil
- Conjuntos Femininos
- Conjuntos Masculinos

## Cards de produto

Cada card deve usar:
- `name`
- `image`
- `priceLabel`
- categoria/público quando útil
- botão **“Pedir pelo WhatsApp”**

Mensagem sugerida para o WhatsApp:
`Olá Dililu! Tenho interesse no produto: {name}. Gostaria de consultar tamanhos disponíveis.`

A ação deve apenas abrir a conversa; não enviar mensagem automaticamente.

## Detalhe do produto

Se o projeto já possuir rota/página de produto, preencher a partir do `slug`. Mostrar:
- imagem principal com proporção preservada;
- nome;
- preço ou “Consulte o valor”;
- “Consulte tamanhos disponíveis”;
- CTA para WhatsApp;
- “Atendimento em Uberlândia/MG”.

Se não houver página de produto, mantenha a arquitetura simples: reutilize cards/modal/solução já existente em vez de reescrever o projeto.

## Migração de referências

Procure referências aos caminhos antigos e atualize conforme `data/assets-map.csv`.

- Remova imports/caminhos quebrados.
- Não mantenha duplicatas de assets antigos se não forem usados.
- Se o catálogo estiver hardcoded, substitua-o por `data/catalogo.json` ou converta o JSON para o formato já adotado, sem perder campos.

## Compatibilidade técnica

Antes de alterar, identifique a stack atual do projeto (React, Next, Vite, HTML etc.) e siga os padrões existentes.

- Não reescreva o projeto do zero.
- Não troque framework/bibliotecas sem necessidade.
- Não quebre rotas, SEO, responsividade, analytics ou integrações existentes.
- Para imagens de produto, use `object-fit: contain`.
- Use lazy loading quando compatível.

## Validação obrigatória

Ao final:
1. Rode build/lint/test existentes.
2. Garanta que não existam imagens 404.
3. Confirme exatamente **80 produtos**.
4. Contagens esperadas:
   - 15 bodies
   - 8 shorts bebê
   - 10 shorts infantil
   - 7 vestidos
   - 40 conjuntos: 30 femininos e 10 masculinos
5. Teste desktop e mobile.
6. Confirme todos os CTAs com o WhatsApp correto.
7. Liste no final os arquivos alterados, testes executados e qualquer decisão técnica.

## Resultado esperado

Entregue o projeto atualizado e funcional, usando o catálogo deste pacote como fonte de verdade, com visual coerente com a Dililu e sem inventar dados comerciais.
