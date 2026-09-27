"use client";

import { useSyncExternalStore } from "react";
import { cartKey, itemKey, parseCart, type CartItem } from "@/lib/cart";
import { useCatalog } from "./catalog-provider";
import type { Product } from "@/lib/catalog";

let memory: string | null = null;
const eventName = "dililu:cart";
function snapshot() {
  if (memory !== null) return memory;
  try { return window.localStorage.getItem(cartKey) ?? "[]"; } catch { return "[]"; }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === cartKey || event.key === null) { memory = null; listener(); } };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", storage); };
}
function save(items: CartItem[], catalog: Product[]) {
  const value = JSON.stringify(items.map(item => ({ ...item, name: catalog.find(p => p.id === item.productId)?.name, price: catalog.find(p => p.id === item.productId)?.price })));
  let persisted = true;
  try { window.localStorage.setItem(cartKey, value); memory = null; } catch { memory = value; persisted = false; }
  window.dispatchEvent(new Event(eventName));
  return persisted;
}

export function useCart() {
  const { products, ready, refresh } = useCatalog();
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = parseCart(raw, products);
  async function add(item: CartItem) {
    const current = await refresh();
    const before = parseCart(snapshot(), current);
    const next = parseCart(JSON.stringify([...before, item]), current);
    if (next.reduce((sum, entry) => sum + entry.quantity, 0) <= before.reduce((sum, entry) => sum + entry.quantity, 0)) throw new Error("Tamanho sem estoque disponível.");
    return save(next, current);
  }
  function quantity(key: string, amount: number) {
    return save(parseCart(JSON.stringify(parseCart(snapshot(), products).map((item) => itemKey(item) === key ? { ...item, quantity: Math.min(99, Math.max(1, amount)) } : item)), products), products);
  }
  function remove(key: string) { return save(parseCart(snapshot(), products).filter((item) => itemKey(item) !== key), products); }
  return { items, add, quantity, remove, ready };
}
