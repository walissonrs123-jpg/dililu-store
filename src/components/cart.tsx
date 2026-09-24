"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/use-cart";
import { ActionLink, Button, Panel } from "@/components/ui";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/catalog";
import { itemKey, totalCents, whatsappMessage } from "@/lib/cart";
import { store } from "@/lib/store";

export function Cart() {
  const { items, quantity, remove } = useCart();
  const [notice, setNotice] = useState("");
  const report = (persisted: boolean) => setNotice(persisted ? "Carrinho atualizado." : "Carrinho atualizado nesta aba. O navegador não permitiu salvar para a próxima visita.");
  if (!items.length) return <Panel className="mt-8 space-y-5"><h2 className="font-display text-2xl">Seu carrinho está vazio.</h2><p className="text-muted">Explore as peças para começar sua seleção.</p><ActionLink href="/catalogo">Explorar catálogo</ActionLink></Panel>;
  return <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
    <div className="space-y-4">{items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId)!;
      const key = itemKey(item);
      return <Panel key={key}>
        <Link href={`/produtos/${product.slug}`} className="font-display text-2xl underline-offset-4 hover:underline">{product.name}</Link>
        <p className="mt-2 text-sm text-muted">Tamanho: {item.size} · Estampa: {item.print}</p>
        <p className="mt-3 text-sm">Unidade: {formatPrice(product.price)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3"><Button variant="secondary" aria-label={`Diminuir quantidade de ${product.name}`} disabled={item.quantity <= 1} onClick={() => report(quantity(key, item.quantity - 1))}>−</Button><span aria-label={`Quantidade: ${item.quantity}`} className="min-w-6 text-center">{item.quantity}</span><Button variant="secondary" aria-label={`Aumentar quantidade de ${product.name}`} disabled={item.quantity >= 99} onClick={() => report(quantity(key, item.quantity + 1))}>+</Button><Button variant="secondary" aria-label={`Remover ${product.name}, tamanho ${item.size}`} onClick={() => report(remove(key))}>Remover</Button></div>
        <p className="mt-4 font-semibold">Subtotal: {formatPrice(Math.round(product.price * 100) * item.quantity / 100)}</p>
      </Panel>;
    })}<p role="status" className="text-sm text-muted">{notice}</p></div>
    <Panel className="h-fit space-y-5"><h2 className="font-display text-2xl">Sua seleção</h2><p className="flex justify-between gap-4"><span>Subtotal dos produtos</span><strong>{formatPrice(totalCents(items) / 100)}</strong></p><p className="text-sm text-muted">Entrega ou retirada a combinar. Disponibilidade, estampas e valores de entrega serão confirmados no atendimento. Pagamento via Pix.</p><ActionLink className="w-full" href={`${store.whatsapp}?text=${encodeURIComponent(whatsappMessage(items))}`}>Enviar pedido pelo WhatsApp</ActionLink><p className="text-xs text-muted">O envio da mensagem inicia o atendimento e não confirma a compra.</p></Panel>
  </div>;
}
