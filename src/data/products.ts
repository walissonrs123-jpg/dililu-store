import type { Product } from "../lib/catalog.ts";

// Prices/attributes from PROJECT_SPEC; sizes from the supplied sample are
// reference sizes only, never inventory. Real product media has not been supplied.
// To replace placeholders, save official photos in public/products/ and fill
// images with /products/filename.ext paths, cover first, then gallery photos.
export const products: Product[] = [
  { id: "body-mbaby", slug: "body-mbaby", name: "Body M Baby", shortDescription: "Body infantil com tecido toque de pêssego.", brand: "M Baby", material: "Toque de pêssego", category: "bodies", audience: "bebe", price: 34.9, sizes: ["P", "M", "G", "GG"], images: [], active: true, stockMode: "consult" },
  { id: "short-mbaby", slug: "short-mbaby", name: "Short M Baby", shortDescription: "Short infantil. Consulte estampas e tamanhos no atendimento.", brand: "M Baby", category: "shorts", audience: "bebe", price: 19.9, sizes: ["P", "M", "G", "GG"], images: [], active: true, stockMode: "consult" },
  { id: "vestido-infantil", slug: "vestido-infantil", name: "Vestido infantil", shortDescription: "Consulte detalhes, tamanhos e estampas pelo WhatsApp.", category: "vestidos", audience: "menina", price: 34.9, sizes: [], images: [], active: true, stockMode: "consult" },
  { id: "conjunto-jennynha-masculino", slug: "conjunto-jennynha-masculino", name: "Conjunto Jennynha Masculino", shortDescription: "Conjunto infantil masculino 100% algodão.", brand: "Jennynha", material: "100% algodão", category: "conjuntos-masculinos", audience: "menino", price: 54.9, sizes: ["2", "4", "6", "8", "10"], images: [], active: true, stockMode: "consult" },
  { id: "conjunto-jennynha-feminino", slug: "conjunto-jennynha-feminino", name: "Conjunto Jennynha Feminino", shortDescription: "Conjunto 100% algodão com cinto e bolsinha inclusos.", brand: "Jennynha", material: "100% algodão", category: "conjuntos-femininos", audience: "menina", price: 64.9, sizes: ["2", "4", "6", "8", "10"], images: [], active: true, stockMode: "consult" },
];
