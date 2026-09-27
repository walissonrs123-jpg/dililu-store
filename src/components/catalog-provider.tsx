"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/lib/catalog";
import { mergeManagedProducts, type ManagedProduct } from "@/lib/managed-products";
import { adminConfig } from "@/lib/admin-config";

const enabled = Boolean(adminConfig.apiUrl);
const CatalogContext = createContext({ products: enabled ? [] as Product[] : staticProducts, ready: !enabled, error: "", refresh: async (): Promise<Product[]> => staticProducts });
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(enabled ? [] : staticProducts);
  const [ready, setReady] = useState(!enabled);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!enabled) return staticProducts;
    try {
      const response = await fetch(`${adminConfig.apiUrl}/products`, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      const body: { products: ManagedProduct[] } = await response.json();
      if (!Array.isArray(body.products)) throw new Error();
      const next = mergeManagedProducts(staticProducts, body.products);
      setProducts(next); setError(""); setReady(true);
      return next;
    } catch {
      setError("Catálogo temporariamente indisponível. Tente novamente."); setReady(false);
      // Never fall back to stale prices or stock after enabling the live catalog.
      throw new Error("Catálogo indisponível");
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const update = () => { void refresh().catch(() => {}); };
    update();
    const timer = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, [refresh]);
  return <CatalogContext.Provider value={{ products, ready, error, refresh }}>{children}</CatalogContext.Provider>;
}
export function useCatalog() { return useContext(CatalogContext); }
export function CatalogState() {
  const { error, refresh } = useCatalog();
  return <p role="status" className="my-6">{error || "Carregando catálogo…"} {error && <button className="underline" onClick={() => void refresh().catch(() => {})}>Tentar novamente</button>}</p>;
}
