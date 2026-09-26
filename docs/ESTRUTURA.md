# Estrutura do catálogo Dililu

A estrutura foi reorganizada para separar **Moda Bebê** e **Moda Infantil**, normalizar nomes de arquivos e facilitar o consumo pelo site.

```text
dililu-catalogo-atualizado/
├── public/
│   └── products/
│       ├── bebe/
│       │   ├── bodies/              (15 imagens)
│       │   └── shorts/              (8 imagens)
│       └── infantil/
│           ├── vestidos/            (7 imagens)
│           ├── shorts/              (10 imagens)
│           └── conjuntos/
│               ├── feminino/        (30 imagens)
│               └── masculino/       (10 imagens)
├── data/
│   ├── catalogo.json
│   ├── resumo.json
│   └── assets-map.csv
├── docs/
│   ├── PROMPT_CODEX.md
│   └── ESTRUTURA.md
└── README.md
```

## Regras aplicadas

- Arquivos em `kebab-case`, minúsculos e sem espaços/acentos.
- Correção de erros evidentes de nomenclatura (`bory` → `body`, variações de `mbaby`, `conjuto` → `conjunto`).
- Nenhuma imagem foi editada, redimensionada ou recomprimida nesta reorganização; os arquivos foram apenas copiados para novos caminhos.
- Produtos sem preço confirmado ficaram com `price: null` e `priceLabel: "Consulte o valor"`.
- Disponibilidade de tamanhos permanece como `consultar`; as faixas em `sizesReference` são apenas referência da categoria.

## Integração no projeto
- README do pacote preservado em docs/CATALOGO_README.md; instruções em docs/PROMPT_CODEX.md. JSON, resumo e mapeamento ficam em data/, sem rotas públicas de documentação.
- src/data/products.ts adapta o JSON, preservando os campos fornecidos. Cards/detalhes usam imagens originais com object-fit: contain e preço informado/consulta.
