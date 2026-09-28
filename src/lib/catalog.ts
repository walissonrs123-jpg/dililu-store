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
  reference?: string;
  inventory?: Record<string, number | null>;
  status?: "ACTIVE" | "SOLD_OUT" | "HIDDEN";
};

export type CatalogFilters = {
  query: string;
  categories: string[];
  ages: string[];
  sizes: string[];
  sexes: string[];
  sort: "name" | "price-asc" | "price-desc";
};

export const initialFilters: CatalogFilters = { query: "", categories: [], ages: [], sizes: [], sexes: [], sort: "name" };
export const categories = catalog.catalog.categories.map(({ id, label, audience }) => ({ id, name: label, audience }));
export const audiences = [
  { id: "bebe", name: "Moda Bebê" }, { id: "infantil", name: "Moda Infantil" },
] as const;
export const referenceSizes = ["P", "M", "G", "GG", "2", "4", "6", "8", "10"];
export const ageOptions = [{ id: "bebe", name: "Bebê" }, ...["2", "4", "6", "8", "10"].map(id => ({ id, name: `${id} anos` }))];
export const sexOptions = [{ id: "feminino", name: "Menina" }, { id: "masculino", name: "Menino" }, { id: "unissex", name: "Unissex" }];

export function productAges(product: Pick<Product, "sizes">): string[] {
  return [...new Set(product.sizes.flatMap(size => ["P", "M", "G", "GG"].includes(size) ? ["bebe"] : ["2", "4", "6", "8", "10"].includes(size) ? [size] : []))];
}
export function productSex(product: Pick<Product, "gender" | "categoryId">): string {
  if (sexOptions.some(option => option.id === product.gender)) return product.gender;
  if (product.categoryId === "conjuntos-femininos") return "feminino";
  if (product.categoryId === "conjuntos-masculinos") return "masculino";
  return "";
}
export function catalogFilterOptions(products: readonly Product[]) {
  const visible = products.filter(product => product.active && product.status !== "HIDDEN");
  return {
    categories: categories.filter(category => visible.some(product => product.categoryId === category.id)),
    ages: ageOptions.filter(age => visible.some(product => productAges(product).includes(age.id))),
    sizes: referenceSizes.filter(size => visible.some(product => product.sizes.includes(size))),
    sexes: sexOptions.filter(sex => visible.some(product => productSex(product) === sex.id)),
  };
}
export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const selected = (key: string, allowed: string[]) => [...new Set(params.getAll(key).flatMap(value => value.split(",")))].filter(value => allowed.includes(value));
  const sort = params.get("sort");
  return { query: (params.get("q") ?? "").slice(0, 200), categories: selected("categoria", categories.map(category => category.id)), ages: selected("age", ageOptions.map(age => age.id)), sizes: selected("size", referenceSizes), sexes: selected("sex", sexOptions.map(sex => sex.id)), sort: sort === "price-asc" || sort === "price-desc" ? sort : "name" };
}
export function catalogFilterParams(filters: CatalogFilters, current = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const key of ["q", "categoria", "age", "size", "sex", "sort"]) params.delete(key);
  if (filters.query) params.set("q", filters.query);
  for (const [key, values] of [["categoria", filters.categories], ["age", filters.ages], ["size", filters.sizes], ["sex", filters.sexes]] as const) for (const value of values) params.append(key, value);
  if (filters.sort !== "name") params.set("sort", filters.sort);
  return params;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const category = categories.find((item) => item.id === product.categoryId)?.name ?? product.category;
    const searchable = normalize([product.name, category, product.category, product.reference, product.id, product.shortDescription, product.description, product.brand, product.material].join(" "));
    return product.active && product.status !== "HIDDEN"
      && terms.every((term) => searchable.includes(term))
      && (!filters.categories.length || filters.categories.includes(product.categoryId))
      && (!filters.ages.length || filters.ages.some(age => productAges(product).includes(age)))
      && (!filters.sizes.length || filters.sizes.some(size => product.sizes.includes(size)))
      && (!filters.sexes.length || filters.sexes.includes(productSex(product)));
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
