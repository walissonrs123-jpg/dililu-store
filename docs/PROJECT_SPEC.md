# Dililu Store V1.1 — Especificação

## Objetivo
Site público de catálogo infantil com carrinho e finalização via WhatsApp, mais um fluxo interno e gratuito de planejamento de Instagram.

## Dados oficiais
- Marca: Dililu
- Instagram: @dililu.moda
- WhatsApp: +55 34 99641-9677
- Cidade: Uberlândia/MG
- Moda Bebê: P, M, G, GG
- Moda Infantil: 2, 4, 6, 8, 10 anos
- Pagamento confirmado: Pix
- Entrega: consultar opções de entrega/retirada
- Não declarar envio nacional

## Categorias
Vestidos, Bodies, Shorts, Conjuntos femininos, Conjuntos masculinos, Kits e Acessórios.

## Site público
### Home
Header, hero, categorias, novidades, destaques, como comprar, CTA WhatsApp, Instagram e footer.

### Catálogo
Busca, filtros por categoria/público/tamanho, ordenação e estado vazio.

### Produto
Galeria, nome, preço, descrição, marca/material opcionais, tamanhos, estampas, disponibilidade, carrinho, WhatsApp e relacionados.

### Carrinho
Itens, variações, quantidade, subtotal, remover e finalizar no WhatsApp. Persistência em localStorage.

### WhatsApp
Base: `https://wa.me/5534996419677`
Mensagem deve listar item, tamanho, estampa, preço, subtotal e pedir confirmação de disponibilidade e entrega/retirada.

## Planejamento de Instagram — interno
Tipos: Feed, Story e Reel.
Campos: id, date, time, format, productId, title, caption, mediaSuggestion, callToAction, status, notes.
Status: planned, ready, scheduled, published, skipped.
O conteúdo deve ser exportável para Markdown e CSV e depois agendado manualmente no Meta Business Suite.

## Produtos conhecidos
- Body infantil: R$ 34,90
- Shortinho infantil: R$ 19,90
- Vestido infantil: R$ 34,90
- Conjunto masculino Jennynha: R$ 54,90
- Conjunto feminino Jennynha com cinto + bolsinha: R$ 64,90

## Atributos conhecidos
- Bodies M Baby: tecido toque de pêssego
- Shorts M Baby: várias estampas e tamanhos
- Conjuntos Jennynha: 100% algodão
- Feminino Jennynha: cinto + bolsinha inclusos

## Regra de mídia
- Story: priorizar peça sozinha, fundo Dililu.
- Feed: priorizar criança usando a roupa.
- Site: foto fiel da peça.

## Fora do escopo
Pagamento online, login, ERP, NF-e, frete automático, painel admin web, Meta API, postagem automática, anúncios pagos, banco de dados, reviews, cupons e fidelidade.

## Aceite
Responsivo; catálogo/filtros; carrinho persistente; WhatsApp correto; SEO básico; build estático; Terraform válido; planner interno funcional; conteúdo interno fora do build público; sem claims não confirmados.
