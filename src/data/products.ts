import catalog from "../../data/catalogo.json" with { type: "json" };
import type { Product } from "../lib/catalog.ts";

// Keep every supplied field; derived fields adapt the existing UI only.
const categoryIds: Record<string, string> = { body: "bodies", "short-bebe": "shorts-bebe", "short-infantil": "shorts-infantil", vestido: "vestidos" };
export const products: Product[] = catalog.products.map((entry) => ({
  ...entry,
  categoryId: entry.category === "conjunto" ? `conjuntos-${entry.gender === "feminino" ? "femininos" : "masculinos"}` : (categoryIds[entry.category] ?? entry.category),
  shortDescription: "Consulte tamanhos disponíveis",
  sizes: entry.sizesReference,
  images: [entry.image],
  stockMode: "consult" as const,
})).sort((a, b) => a.order - b.order);

// Generic old URLs lead to a category, not an invented equivalent product.
export const legacyProductCategories: Record<string, string> = {
  "body-mbaby": "bodies", "short-mbaby": "shorts-bebe", "vestido-infantil": "vestidos",
  "conjunto-jennynha-feminino": "conjuntos-femininos", "conjunto-jennynha-masculino": "conjuntos-masculinos",
};
