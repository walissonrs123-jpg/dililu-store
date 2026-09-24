"use client";

import { useSyncExternalStore } from "react";
import { cartKey, itemKey, parseCart, type CartItem } from "@/lib/cart";

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
function save(items: CartItem[]) {
  const value = JSON.stringify(items);
  let persisted = true;
  try { window.localStorage.setItem(cartKey, value); memory = null; } catch { memory = value; persisted = false; }
  window.dispatchEvent(new Event(eventName));
  return persisted;
}

export function useCart() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = parseCart(raw);
  function add(item: CartItem) {
    return save(parseCart(JSON.stringify([...parseCart(snapshot()), item])));
  }
  function quantity(key: string, amount: number) {
    return save(parseCart(snapshot()).map((item) => itemKey(item) === key ? { ...item, quantity: Math.min(99, Math.max(1, amount)) } : item));
  }
  function remove(key: string) { return save(parseCart(snapshot()).filter((item) => itemKey(item) !== key)); }
  return { items, add, quantity, remove };
}
