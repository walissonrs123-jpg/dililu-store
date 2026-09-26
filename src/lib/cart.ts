import { products } from "../data/products.ts";
import { formatPrice, productPrice } from "./catalog.ts";

export type CartItem = { productId: string; size: string; print: string; quantity: number };
export const cartKey = "dililu.cart.v1";
export function itemKey(item: Pick<CartItem, "productId" | "size" | "print">) {
  return JSON.stringify([item.productId, item.size, item.print]);
}

export function parseCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const merged = new Map<string, CartItem>();
    for (const value of parsed.slice(0, 100)) {
      if (!value || typeof value !== "object") continue;
      const item = value as Partial<CartItem>;
      const product = products.find((entry) => entry.active && entry.stockMode !== "unavailable" && entry.id === item.productId);
      if (!product || typeof item.size !== "string" || typeof item.print !== "string" || !Number.isInteger(item.quantity) || (item.quantity ?? 0) < 1) continue;
      if (item.size !== "A consultar" && !product.sizes.includes(item.size)) continue;
      if (item.print !== "A consultar" && !(product.prints ?? []).includes(item.print)) continue;
      const valid = { productId: product.id, size: item.size, print: item.print, quantity: Math.min(item.quantity!, 99) };
      const key = itemKey(valid);
      valid.quantity = Math.min(99, valid.quantity + (merged.get(key)?.quantity ?? 0));
      merged.set(key, valid);
    }
    return [...merged.values()];
  } catch { return []; }
}

export function totalCents(items: CartItem[]): number | null {
  if (items.some((item) => products.find((entry) => entry.id === item.productId)?.price === null)) return null;
  return items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product && product.price !== null ? Math.round(product.price * 100) * item.quantity : 0);
  }, 0);
}

export function whatsappMessage(items: CartItem[]) {
  const lines = ["Olá, Dililu! Gostaria de consultar este pedido:", ""];
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) continue;
    lines.push(`${item.quantity} × ${product.name}`, `Tamanho de referência desejado: ${item.size} | Estampa: ${item.print}`, `Preço unitário: ${productPrice(product)} | Subtotal: ${formatPrice(product.price === null ? null : Math.round(product.price * 100) * item.quantity / 100)}`, "");
  }
  const total = totalCents(items);
  lines.push(`Subtotal dos produtos: ${formatPrice(total === null ? null : total / 100)}`, "", "Consulte tamanhos disponíveis. Entrega ou retirada a combinar.");
  return lines.join("\n");
}
