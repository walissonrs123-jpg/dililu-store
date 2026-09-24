export type Audience = "bebe" | "menina" | "menino" | "unissex";
export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  brand?: string;
  material?: string;
  category: string;
  audience: Audience;
  price: number;
  sizes: string[];
  prints?: string[];
  images: string[];
  active: boolean;
  featured?: boolean;
  newArrival?: boolean;
  stockMode: "consult" | "available" | "unavailable";
};

export type CatalogFilters = {
  query: string;
  category: string;
  audience: string;
  size: string;
  sort: "name" | "price-asc" | "price-desc";
};

export const initialFilters: CatalogFilters = { query: "", category: "", audience: "", size: "", sort: "name" };
export const categories = [
  { id: "vestidos", name: "Vestidos" },
  { id: "bodies", name: "Bodies" },
  { id: "shorts", name: "Shorts" },
  { id: "conjuntos-femininos", name: "Conjuntos femininos" },
  { id: "conjuntos-masculinos", name: "Conjuntos masculinos" },
  { id: "kits", name: "Kits" },
  { id: "acessorios", name: "Acessórios" },
] as const;
export const audiences = [
  { id: "bebe", name: "Bebê" }, { id: "menina", name: "Menina" },
  { id: "menino", name: "Menino" }, { id: "unissex", name: "Unissex" },
] as const;
export const referenceSizes = ["P", "M", "G", "GG", "2", "4", "6", "8", "10"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const category = categories.find((item) => item.id === product.category)?.name ?? product.category;
    const searchable = normalize([product.name, product.shortDescription, product.brand, product.material, category].join(" "));
    return product.active
      && terms.every((term) => searchable.includes(term))
      && (!filters.category || product.category === filters.category)
      && (!filters.audience || product.audience === filters.audience)
      && (!filters.size || product.sizes.includes(filters.size));
  }).sort((left, right) => {
    const difference = filters.sort === "price-asc" ? left.price - right.price : filters.sort === "price-desc" ? right.price - left.price : 0;
    return difference || left.name.localeCompare(right.name, "pt-BR");
  });
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
