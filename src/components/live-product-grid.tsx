"use client";
import { useCatalog, CatalogState } from "./catalog-provider";
import { ProductCard } from "./product-card";
export function LiveProductGrid({ categoryId, excludeId, limit = 3, newArrival = false }: { categoryId?: string; excludeId?: string; limit?: number; newArrival?: boolean }) {
  const { products, ready } = useCatalog();
  if (!ready) return <CatalogState />;
  const visible = products.filter(item => item.active && (!categoryId || item.categoryId === categoryId) && item.id !== excludeId && (!newArrival || item.newArrival)).slice(0, limit);
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item => <ProductCard key={item.id} product={item} />)}</div>;
}
