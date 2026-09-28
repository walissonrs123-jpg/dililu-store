"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalog, CatalogState } from "@/components/catalog-provider";
import { catalogFilterOptions, catalogFilterParams, filterProducts, initialFilters, parseCatalogFilters, type CatalogFilters } from "@/lib/catalog";
import { Button, Panel, Select } from "@/components/ui";
import { ProductCard } from "@/components/product-card";
import { CatalogFiltersPanel } from "@/components/catalog-filters";

export function Catalog() {
  const { products, ready } = useCatalog();
  const params = useSearchParams();
  const filters = useMemo(() => parseCatalogFilters(new URLSearchParams(params)), [params]);
  const options = useMemo(() => catalogFilterOptions(products), [products]);
  const matches = useMemo(() => filterProducts(products, filters), [products, filters]);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function update(next: CatalogFilters) {
    const query = catalogFilterParams(next, new URLSearchParams(params)).toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }
  const clear = () => update(initialFilters);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    const button = trigger.current;
    const previousOverflow = document.body.style.overflow;
    modal?.showModal();
    document.body.style.overflow = "hidden";
    modal?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    const media = window.matchMedia("(min-width: 1024px)");
    const resized = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", resized);
    return () => { media.removeEventListener("change", resized); modal?.close(); document.body.style.overflow = previousOverflow; if (button?.isConnected) button.focus({ preventScroll: true }); };
  }, [open]);
  if (!ready) return <CatalogState />;
  return <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside aria-label="Filtros do catálogo" className="hidden rounded-card border border-line bg-white p-5 lg:block"><CatalogFiltersPanel prefix="desktop" filters={filters} options={options} update={update} clear={clear} /></aside>
    <section aria-labelledby="catalog-heading" className="min-w-0 space-y-7">
      <header className="space-y-3"><p className="text-xs font-bold uppercase tracking-widest text-brand">Moda bebê e infantil</p><h1 id="catalog-heading" className="font-display text-4xl sm:text-5xl">Encontre a peça ideal</h1><p className="max-w-2xl text-muted">Busque e filtre as peças para encontrar o que combina com seu pequeno.</p></header>
      <Button ref={trigger} variant="secondary" className="w-full lg:hidden" aria-expanded={open} aria-controls="catalog-filter-dialog" aria-haspopup="dialog" onClick={() => setOpen(true)}>Filtros</Button>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0" aria-live="polite" aria-atomic="true"><p className="break-words font-semibold">{filters.query.trim() ? `Resultados para “${filters.query.trim()}”` : "Todas as peças"}</p><p className="text-sm text-muted">{matches.length} {matches.length === 1 ? "produto" : "produtos"}</p></div>
        <div className="w-full sm:w-44"><label htmlFor="ordenar" className="mb-2 block text-sm font-semibold">Ordenar por</label><Select id="ordenar" value={filters.sort} onChange={event => update({ ...filters, sort: event.target.value as CatalogFilters["sort"] })}><option value="name">Nome</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></Select></div>
      </div>
      {matches.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{matches.map(product => <ProductCard key={product.id} product={product} />)}</div> : <Panel className="space-y-4 text-center"><h2 className="font-display text-2xl">Nenhuma peça com esses filtros.</h2><p className="text-muted">Tente outro termo ou remova os filtros para continuar.</p><Button onClick={clear}>Limpar filtros e ver todas as peças</Button></Panel>}
    </section>
    <dialog ref={dialog} id="catalog-filter-dialog" aria-labelledby="filter-dialog-title" onCancel={event => { event.preventDefault(); setOpen(false); }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} className="fixed inset-y-0 left-auto right-0 m-0 ml-auto h-dvh max-h-dvh w-[min(92vw,360px)] max-w-full border-l border-line bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/40">
      <div className="flex h-full flex-col"><header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5 py-4"><h2 id="filter-dialog-title" className="font-display text-2xl">Filtros</h2><Button variant="secondary" aria-label="Fechar filtros" onClick={() => setOpen(false)}>Fechar</Button></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><CatalogFiltersPanel prefix="mobile" filters={filters} options={options} update={update} clear={clear} /></div><footer className="shrink-0 border-t border-line bg-white p-4"><Button className="w-full" onClick={() => setOpen(false)}>Ver {matches.length} {matches.length === 1 ? "produto" : "produtos"}</Button></footer></div>
    </dialog>
  </div>;
}
