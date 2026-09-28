import { Button, Input } from "./ui";
import type { CatalogFilters, catalogFilterOptions } from "@/lib/catalog";

type Props = { prefix: string; filters: CatalogFilters; options: ReturnType<typeof catalogFilterOptions>; update: (filters: CatalogFilters) => void; clear: () => void };
export function CatalogFiltersPanel({ prefix, filters, options, update, clear }: Props) {
  function toggle(key: "categories" | "ages" | "sizes" | "sexes", value: string) {
    update({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter(item => item !== value) : [...filters[key], value] });
  }
  const group = (title: string, key: "categories" | "ages" | "sexes", values: { id: string; name: string }[]) => values.length > 0 && <fieldset>
    <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand">{title}</legend>
    {values.map(option => <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input className="h-4 w-4 shrink-0 accent-brand" type="checkbox" checked={filters[key].includes(option.id)} onChange={() => toggle(key, option.id)} />{option.name}</label>)}
  </fieldset>;
  return <form role="search" aria-label="Filtrar catálogo" className="space-y-6" onSubmit={event => event.preventDefault()}>
    <div><label htmlFor={`${prefix}-busca`} className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand">Busca</label>
      <div className="relative"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="pointer-events-none absolute left-3 top-4 h-5 w-5 text-muted"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><Input id={`${prefix}-busca`} aria-label="Buscar uma peça" type="search" maxLength={200} placeholder="Buscar produto..." className="pl-10" value={filters.query} onChange={event => update({ ...filters, query: event.target.value })} /></div>
    </div>
    {group("Categoria", "categories", options.categories)}
    {group("Idade", "ages", options.ages)}
    {options.sizes.length > 0 && <fieldset><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-brand">Tamanho</legend><div className="flex flex-wrap gap-2">{options.sizes.map(size => <button type="button" key={size} aria-label={`Tamanho ${size}`} aria-pressed={filters.sizes.includes(size)} className={`min-h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold ${filters.sizes.includes(size) ? "border-brand bg-lilac text-brand" : "border-line bg-paper text-ink hover:border-brand"}`} onClick={() => toggle("sizes", size)}>{size}</button>)}</div></fieldset>}
    {group("Sexo", "sexes", options.sexes)}
    <Button variant="secondary" className="w-full" onClick={clear}>Limpar filtros</Button>
  </form>;
}
