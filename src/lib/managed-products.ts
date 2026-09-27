import type { Product } from "./catalog.ts";
import { categories, formatPrice } from "./catalog.ts";

export type ProductStatus = "ACTIVE" | "SOLD_OUT" | "HIDDEN";
export type ManagedProduct = {
  productId: string; name: string; reference: string; categoryId: string;
  price: number | null; priceOnRequest: boolean; status: ProductStatus;
  sizes: Record<string, number | null>; image: string; slug: string; version: number;
  effectiveStatus?: ProductStatus;
};
export function mergeManagedProducts(original: Product[], records: ManagedProduct[]): Product[] {
  return records.flatMap(record => {
    const base = original.find(item => item.id === record.productId);
    const category = categories.find(item => item.id === record.categoryId);
    if (!base || !category || record.status === "HIDDEN") return [];
    const amounts = Object.values(record.sizes);
    const unavailable = record.status === "SOLD_OUT" || (amounts.length > 0 && amounts.every(value => value === 0));
    const price = record.priceOnRequest ? null : record.price;
    return [{ ...base, name: record.name, reference: record.reference, categoryId: category.id, audience: category.audience, price, priceLabel: formatPrice(price), active: true,
      sizes: Object.keys(record.sizes), inventory: record.sizes, status: unavailable ? "SOLD_OUT" as const : "ACTIVE" as const,
      stockMode: unavailable ? "unavailable" as const : amounts.some(value => value === null) ? "consult" as const : "available" as const }];
  }).sort((a, b) => a.order - b.order);
}
export function stockLimit(product: Product, size: string): number {
  if (!product.active || product.stockMode === "unavailable" || product.status === "HIDDEN") return 0;
  if (product.sizes.length && !product.sizes.includes(size)) return 0;
  return Math.min(99, product.inventory?.[size] ?? 99);
}
