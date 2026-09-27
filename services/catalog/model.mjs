export const categorySizes = {
  bodies: ["P", "M", "G", "GG"], "shorts-bebe": ["P", "M", "G", "GG"],
  "shorts-infantil": ["2", "4", "6", "8", "10"], vestidos: ["2", "4", "6", "8", "10"],
  "conjuntos-femininos": ["2", "4", "6", "8", "10"], "conjuntos-masculinos": ["2", "4", "6", "8", "10"],
};

export function effectiveStatus(product) {
  if (product.status !== "ACTIVE") return product.status;
  const quantities = Object.values(product.sizes);
  return quantities.length > 0 && quantities.every(value => value === 0) ? "SOLD_OUT" : "ACTIVE";
}

// Only editable fields are accepted. IDs, URLs, photos and source metadata are immutable.
export function updateProduct(current, input) {
  const fields = ["name", "reference", "categoryId", "price", "priceOnRequest", "status", "sizes", "version"];
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !fields.includes(key))) throw new Error("Campos não permitidos.");
  if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 160) throw new Error("Nome inválido.");
  if (typeof input.reference !== "string" || !input.reference.trim() || input.reference.length > 80) throw new Error("Referência inválida.");
  if (typeof input.categoryId !== "string" || !Object.hasOwn(categorySizes, input.categoryId)) throw new Error("Categoria inválida.");
  if (typeof input.priceOnRequest !== "boolean" || (input.priceOnRequest ? input.price !== null : typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0 || input.price > 100000 || Math.abs(input.price * 100 - Math.round(input.price * 100)) > 0.000001)) throw new Error("Preço inválido.");
  if (!["ACTIVE", "SOLD_OUT", "HIDDEN"].includes(input.status)) throw new Error("Status inválido.");
  if (!input.sizes || typeof input.sizes !== "object" || Array.isArray(input.sizes) || Object.keys(input.sizes).length === 0) throw new Error("Escolha ao menos um tamanho.");
  for (const [size, quantity] of Object.entries(input.sizes)) {
    if (!categorySizes[input.categoryId].includes(size) || (quantity !== null && (!Number.isInteger(quantity) || quantity < 0 || quantity > 9999))) throw new Error("Tamanho ou estoque inválido.");
    // Null is reserved for pre-existing, unknown stock. New sizes need a real quantity.
    if (quantity === null && current.sizes[size] !== null) throw new Error("Informe o estoque do novo tamanho.");
  }
  if (!Number.isInteger(input.version) || input.version !== current.version) {
    const error = new Error("Produto alterado em outra sessão. Recarregue antes de salvar.");
    error.name = "ConflictError";
    throw error;
  }
  return { ...current, ...input, name: input.name.trim(), reference: input.reference.trim(), version: current.version + 1 };
}

export function isAdministrator(claims) {
  const groups = claims?.["cognito:groups"];
  // API Gateway represents array claims as arrays or bracket/comma-separated strings.
  const list = Array.isArray(groups) ? groups : typeof groups === "string" ? groups.replace(/[\[\]"]/g, "").split(",").map(value => value.trim()) : [];
  return claims?.token_use === "access" && list.includes("dililu-admin");
}
