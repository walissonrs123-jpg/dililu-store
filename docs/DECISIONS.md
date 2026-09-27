# Decisões
- D001: Finalização pelo WhatsApp.
- D002: Catálogo versionado no código.
- D003: Carrinho em localStorage.
- D004: S3 + CloudFront para hospedagem.
- D005: Sem banco e sem painel admin web na V1.1.
- D006: Sem Meta API e sem postagem automática.
- D007: Planner em `content/`; Meta Business Suite usado manualmente e gratuitamente.
- D008: Sem impulsionamento pago nesta fase.
- D009: Story prioriza peça sozinha; Feed prioriza criança usando a peça.
- D010: Não declarar envio nacional.
- D011: Planejamento AWS registrado em `docs/AWS_PLAN.md` em 2026-09-24; sem provisionamento e sem conclusão antecipada de M8/M9. Propostas técnicas serão validadas com o build e os dados reais da conta.
- D012: Endereço provisório confirmado pelo usuário: `dililu.sofbrasil.com.br`. Priorizar a zona Route 53 existente de `sofbrasil.com.br`, gerenciando apenas os registros necessários ao subdomínio e à validação do certificado.
- D013: Conta AWS validada `320169806724`; Terraform com allowed_account_ids para evitar execução em outra conta. Reutilizar zona `Z0676301JLBSS7IFN575`; certificados existentes não cobrem Dililu, portanto planejar certificado específico.
- D014: Preparação antecipada da infraestrutura autorizada pelo usuário; DNS de publicação permanece desligado até existir artefato validado. Sem apply ou contorno via CLI da proibição existente. Separar estado e site em dois conjuntos Terraform.
- D015: Em 2026-09-24, autorização explícita excepcional para um único apply das 13 criações de site, condicionado à comparação do novo plano com o validado e zero changes/destroys. Bootstrap (6 criações), publicação DNS, upload e futuros applies não autorizados. Estado local preservado, pois criar o backend excederia essa autorização.
- D016: M0 usa Node 24 LTS e Git locais em `.tools/`, export Next.js estático e build com dois workers para reduzir carga na máquina. Dependências fixadas no package-lock; validações agrupadas em `npm run verify`.
- D017: M1 adota tokens provisórios lilás/menta e fontes do sistema, com nome Dililu em texto até receber a logo oficial. Nenhuma imagem de marca ou produto inventada; ativos reais continuam pendentes para apresentação final.
- D018: M2 usa preços/atributos da especificação e tamanhos do sample apenas como referência, sem afirmar estoque. Vestido sem grade informada fica com tamanhos a consultar. Sem selos de novidade; fotos faltantes recebem aviso textual, sem imagens substitutas.
- D019: Carrinho persiste apenas IDs/variações/quantidades; preços são relidos do catálogo e somados em centavos. Armazenamento indisponível usa memória da aba com aviso. Planner local exporta Markdown/CSV sem API Meta; CI não publica nem acessa AWS.

## 2026-09-26 — Catálogo fornecido (80 peças)
- data/catalogo.json é a fonte principal; adaptador preserva todos os campos e acrescenta apenas compatibilidade com a interface existente. Fotos copiadas sem alteração, comprovada por SHA-256.
- Preços nulos ficam sob consulta também no carrinho/WhatsApp, sem total numérico incompleto. Tamanhos são referência, nunca estoque.
- URLs genéricas antigas encaminham por link às categorias; carrinhos com IDs removidos são descartados pela validação existente, sem inventar correspondência de estampas. Rascunhos Instagram antigos ficam genéricos até selecionar uma peça atual.
- Atualização local; publicação AWS não faz parte deste pedido.

## 2026-09-27 — Administração local autorizada
- Novo pedido amplia o escopo para admin privado; preparação local apenas. Terraform separado em infra/admin, sem modificar a infraestrutura do site. Cognito PKCE, HTTP API/JWT/grupo, Lambda e DynamoDB sob demanda; nenhuma credencial no frontend.
- Sem estoque informado, seed usa null/a consultar. Quantidades conhecidas limitam o carrinho; WhatsApp nunca baixa estoque. Seed condicional não sobrescreve registros; edição usa versão para evitar perda por concorrência.
- Dez shorts infantis reconhecidos para proposta de preço. Quarenta conjuntos sem marca nos metadados permanecem sob consulta até confirmar Jennynha. Catálogo/imagens originais preservados.
- Carrinho mantém a chave existente e salva nome/preço como snapshot, mas recalcula usando catálogo atual. API configurada indisponível bloqueia compra em vez de reusar preço/estoque estático.
- Validação local usa o mesmo export e navegador desktop/mobile. Preview resolve a diferença de caminhos RSC no Windows, sem mudar a aplicação ou o deploy Linux ([referência Next.js](https://github.com/vercel/next.js/issues/85374)). Logo existente referenciada como ícone para evitar solicitação de favicon ausente.
