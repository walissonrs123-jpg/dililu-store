"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Input, Panel, Select } from "./ui";
import { categories, formatPrice } from "@/lib/catalog";
import type { ManagedProduct, ProductStatus } from "@/lib/managed-products";
import { adminConfig } from "@/lib/admin-config";
import { finishLogin, login, logout } from "@/lib/admin-auth";

const statusNames = { ACTIVE: "ATIVO", SOLD_OUT: "ESGOTADO", HIDDEN: "OCULTO" };
const allowedSizes = (categoryId: string) => categories.find(c => c.id === categoryId)?.audience === "bebe" ? ["P", "M", "G", "GG"] : ["2", "4", "6", "8", "10"];
type Session = { token: string; expiresAt: number };
async function request(path: string, session: Session, body?: unknown) {
  if (Date.now() >= session.expiresAt) throw new Error("Sessão expirada. Entre novamente.");
  const response = await fetch(`${adminConfig.apiUrl}${path}`, { method: body ? "PUT" : "GET", cache: "no-store", credentials: "omit", headers: { Authorization: `Bearer ${session.token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Acesso negado. Entre com uma conta administradora." : result.message || "Falha ao acessar catálogo.");
  return result;
}
export function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [editing, setEditing] = useState<ManagedProduct | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(adminConfig.apiUrl && adminConfig.cognitoDomain && adminConfig.clientId);
  useEffect(() => {
    if (!configured) return;
    let active = true;
    void finishLogin().then(async auth => {
      if (!auth) return;
      const result = await request("/admin/products", auth);
      if (active) { setSession(auth); setProducts(result.products); }
    }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [configured]);
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => { setSession(null); setProducts([]); setEditing(null); setNotice("Sessão expirada. Entre novamente."); }, Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);
  async function reload() {
    if (!session) return;
    setBusy(true);
    try { const result = await request("/admin/products", session); setProducts(result.products); setEditing(null); setNotice("Catálogo atualizado."); }
    catch (error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  if (!session) return <Panel className="mt-6 space-y-4"><p>{configured ? "Entre para administrar o catálogo." : "Painel preparado. A autenticação será habilitada após a implantação autorizada."}</p><Button disabled={!configured} onClick={() => void login().catch(error => setNotice(error.message))}>Entrar com segurança</Button><p role="status">{notice}</p></Panel>;
  const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visible = products.filter(p => normalized(`${p.name} ${p.reference} ${categories.find(c => c.id === p.categoryId)?.name}`).includes(normalized(query)));
  return <div className="mt-6 space-y-6">
    <div className="flex flex-wrap gap-3"><Button variant="secondary" disabled={busy} onClick={() => void reload()}>Recarregar</Button><Button variant="secondary" onClick={() => { setSession(null); setProducts([]); setEditing(null); logout(); }}>Sair</Button></div>
    <p role="status">{notice}</p>
    {editing ? <Panel><ProductEditor key={`${editing.productId}-${editing.version}`} product={editing} busy={busy} cancel={() => setEditing(null)} save={async body => {
      setBusy(true);
      try {
        const updated: ManagedProduct = await request(`/admin/products/${editing.productId}`, session, body);
        setProducts(current => current.map(p => p.productId === updated.productId ? updated : p));
        setEditing(null); setNotice("Produto salvo. Estoque não é baixado automaticamente pelo WhatsApp.");
      } catch (error) { setNotice((error as Error).message); }
      finally { setBusy(false); }
    }} /></Panel> : <>
      <label className="block">Pesquisar nome, referência ou categoria<Input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <p>{visible.length} de {products.length} produtos</p>
      <div className="grid gap-4 md:grid-cols-2">{visible.map(product => <Panel key={product.productId}>
        <div className="flex gap-4"><Image src={product.image} width={80} height={96} alt={product.name} className="h-24 w-20 shrink-0 rounded-xl object-contain" /><div className="min-w-0"><h2 className="break-words font-semibold">{product.name}</h2><p className="break-words text-sm">Ref.: {product.reference}</p><p className="text-sm">{categories.find(c => c.id === product.categoryId)?.name}</p><p>{formatPrice(product.priceOnRequest ? null : product.price)}</p></div></div>
        <p className="mt-3 text-sm">Tamanhos / estoque: {Object.entries(product.sizes).map(([size, quantity]) => `${size}: ${quantity ?? "a consultar"}`).join(" · ")}</p>
        <p className="my-3 font-semibold">{statusNames[product.effectiveStatus ?? product.status]}</p><Button onClick={() => { setEditing(product); setNotice(""); }}>Editar {product.reference}</Button>
      </Panel>)}</div>
    </>}
  </div>;
}
function ProductEditor({ product, busy, cancel, save }: { product: ManagedProduct; busy: boolean; cancel: () => void; save: (value: unknown) => Promise<void> }) {
  const [draft, setDraft] = useState(product);
  function change<K extends keyof ManagedProduct>(key: K, value: ManagedProduct[K]) { setDraft(current => ({ ...current, [key]: value })); }
  return <form className="grid gap-5 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); void save({ name: draft.name, reference: draft.reference, categoryId: draft.categoryId, price: draft.priceOnRequest ? null : draft.price, priceOnRequest: draft.priceOnRequest, status: draft.status, sizes: draft.sizes, version: draft.version }); }}>
    <h2 className="font-display text-2xl sm:col-span-2">Editar produto</h2>
    <label>Nome<Input required maxLength={160} value={draft.name} onChange={e => change("name", e.target.value)} /></label>
    <label>Referência<Input required maxLength={80} value={draft.reference} onChange={e => change("reference", e.target.value)} /></label>
    <label>Categoria<Select value={draft.categoryId} onChange={e => setDraft(current => ({ ...current, categoryId: e.target.value, sizes: Object.fromEntries(Object.entries(current.sizes).filter(([size]) => allowedSizes(e.target.value).includes(size))) }))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
    <label>Status<Select value={draft.status} onChange={e => change("status", e.target.value as ProductStatus)}>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
    <label>Preço (R$)<Input type="number" min="0.01" max="100000" step="0.01" required={!draft.priceOnRequest} disabled={draft.priceOnRequest} value={draft.price ?? ""} onChange={e => change("price", e.target.value === "" ? null : Number(e.target.value))} /></label>
    <label className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={draft.priceOnRequest} onChange={e => change("priceOnRequest", e.target.checked)} />Preço sob consulta</label>
    <fieldset className="space-y-3 sm:col-span-2"><legend className="mb-3 font-semibold">Tamanhos e quantidades</legend><p className="text-sm">Selecione apenas tamanhos aplicáveis. Estoque não informado permanece a consultar; zero significa esgotado.</p>
      {allowedSizes(draft.categoryId).map(size => <div key={size} className="flex items-center gap-4"><label className="flex min-w-20 items-center gap-2"><input type="checkbox" checked={Object.hasOwn(draft.sizes, size)} onChange={e => { const sizes = { ...draft.sizes }; if (e.target.checked) sizes[size] = product.sizes[size] ?? 0; else delete sizes[size]; change("sizes", sizes); }} />{size}</label>{Object.hasOwn(draft.sizes, size) && <Input className="max-w-44" aria-label={`Estoque ${size}`} type="number" min="0" max="9999" step="1" placeholder="A consultar" required={product.sizes[size] !== null} value={draft.sizes[size] ?? ""} onChange={e => change("sizes", { ...draft.sizes, [size]: e.target.value === "" ? null : Number(e.target.value) })} />}</div>)}
    </fieldset>
    <Button type="submit" disabled={busy || Object.keys(draft.sizes).length === 0}>{busy ? "Salvando…" : "Salvar produto"}</Button><Button variant="secondary" disabled={busy} onClick={cancel}>Cancelar</Button>
  </form>;
}
