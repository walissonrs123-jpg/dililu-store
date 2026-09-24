"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { audiences, categories, filterProducts, initialFilters, referenceSizes, type CatalogFilters } from "@/lib/catalog";
import { Button, Input, Panel, Select } from "@/components/ui";
import { ProductCard } from "@/components/product-card";

export function Catalog() {
  const params = useSearchParams();
  const category = params.get("categoria") ?? "";
  const [filters, setFilters] = useState<CatalogFilters>(() => ({ ...initialFilters, category: categories.some((item) => item.id === category) ? category : "" }));
  const matches = filterProducts(products, filters);
  function update<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }
  return <div className="mt-8 space-y-8">
    <Panel>
      <form role="search" aria-label="Filtrar catálogo" onSubmit={(event) => event.preventDefault()} className="grid items-end gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1"><label htmlFor="busca" className="mb-2 block text-sm font-semibold">Buscar uma peça</label><Input id="busca" type="search" placeholder="Nome, marca ou tecido" value={filters.query} onChange={(event) => update("query", event.target.value)} /></div>
        <div><label htmlFor="categoria" className="mb-2 block text-sm font-semibold">Categoria</label><Select id="categoria" value={filters.category} onChange={(event) => update("category", event.target.value)}><option value="">Todas as categorias</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>
        <div><label htmlFor="publico" className="mb-2 block text-sm font-semibold">Público</label><Select id="publico" value={filters.audience} onChange={(event) => update("audience", event.target.value)}><option value="">Todos os públicos</option>{audiences.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>
        <div><label htmlFor="tamanho" className="mb-2 block text-sm font-semibold">Tamanho de referência</label><Select id="tamanho" value={filters.size} onChange={(event) => update("size", event.target.value)}><option value="">Todos os tamanhos</option>{referenceSizes.map((size) => <option key={size} value={size}>{/^\d+$/.test(size) ? `${size} anos` : size}</option>)}</Select></div>
        <div><label htmlFor="ordenar" className="mb-2 block text-sm font-semibold">Ordenar por</label><Select id="ordenar" value={filters.sort} onChange={(event) => update("sort", event.target.value as CatalogFilters["sort"])}><option value="name">Nome</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></Select></div>
        <Button variant="secondary" onClick={() => setFilters(initialFilters)}>Limpar filtros</Button>
      </form>
    </Panel>
    <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">{matches.length} {matches.length === 1 ? "peça encontrada" : "peças encontradas"}. Confirme tamanhos, estampas e disponibilidade no atendimento.</p>
    {matches.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{matches.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <Panel className="space-y-4 text-center"><h2 className="font-display text-2xl">Nenhuma peça com esses filtros.</h2><p className="text-muted">Tente outro termo ou remova os filtros para continuar.</p><Button onClick={() => setFilters(initialFilters)}>Ver todas as peças</Button></Panel>}
  </div>;
}
