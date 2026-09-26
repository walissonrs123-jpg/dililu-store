import catalog from "../../data/catalogo.json" with { type: "json" };

export type Product = (typeof catalog.products)[number] & {
  shortDescription: string;
  description?: string;
  brand?: string;
  material?: string;
  categoryId: string;
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
export const categories = catalog.catalog.categories.map(({ id, label, audience }) => ({ id, name: label, audience }));
export const audiences = [
  { id: "bebe", name: "Moda Bebê" }, { id: "infantil", name: "Moda Infantil" },
] as const;
export const referenceSizes = ["P", "M", "G", "GG", "2", "4", "6", "8", "10"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId)?.name ?? product.category;
    const searchable = normalize([product.name, product.shortDescription, product.brand, product.material, category].join(" "));
    return product.active
      && terms.every((term) => searchable.includes(term))
      && (!filters.category || product.categoryId === filters.category)
      && (!filters.audience || product.audience === filters.audience)
      && (!filters.size || product.sizes.includes(filters.size));
  }).sort((left, right) => {
    if (filters.sort !== "name" && (left.price === null || right.price === null) && left.price !== right.price) return left.price === null ? 1 : -1;
    const difference = left.price !== null && right.price !== null ? (filters.sort === "price-asc" ? left.price - right.price : filters.sort === "price-desc" ? right.price - left.price : 0) : 0;
    return difference || left.name.localeCompare(right.name, "pt-BR");
  });
}

export function formatPrice(value: number | null): string {
  if (value === null) return "Consulte o valor";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function productPrice(product: Pick<Product, "price" | "priceLabel">) {
  return product.price === null ? "Consulte o valor" : product.priceLabel;
}
