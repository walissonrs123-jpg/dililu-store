"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionLink, Button, Select } from "@/components/ui";
import { productPrice, type Product } from "@/lib/catalog";
import { store } from "@/lib/store";
import { useCart } from "@/components/use-cart";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { useCatalog, CatalogState } from "./catalog-provider";
import { stockLimit } from "@/lib/managed-products";

export function ProductDetails({ product: initialProduct }: { product: Product }) {
  const { products, ready } = useCatalog();
  const product = products.find(item => item.id === initialProduct.id);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [print, setPrint] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { add } = useCart();
  if (!ready) return <CatalogState />;
  if (!product) return <p className="my-8" role="status">Produto indisponível.</p>;
  const message = `Olá Dililu! Tenho interesse no produto: ${product.name}. Gostaria de consultar tamanhos disponíveis. Tamanho de referência desejado: ${size || "a consultar"}.`;
  return <div className="mt-8 grid gap-10 lg:grid-cols-2">
    <div>
      {product.images[image] ? <Image src={product.images[image]} width={800} height={960} alt={`${product.name} — foto ${image + 1}`} className="aspect-[5/6] w-full rounded-card bg-mint object-contain" priority /> : <ProductPlaceholder className="rounded-card border border-line" />}
      {product.images.length > 1 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Fotos do produto">{product.images.map((source, index) => <Button key={source} variant="secondary" aria-pressed={index === image} onClick={() => setImage(index)}>Foto {index + 1}</Button>)}</div>}
    </div>
    <div className="space-y-6">
      <h1 className="font-display text-4xl leading-tight">{product.name}</h1>
      <p className="text-2xl font-semibold">{productPrice(product)}</p>
      {product.stockMode === "unavailable" && <p className="font-semibold text-brand">Esgotado</p>}
      <p className="text-muted">{product.description || product.shortDescription}</p>
      <dl className="space-y-2 text-sm">{product.brand && <div><dt className="inline font-semibold">Marca: </dt><dd className="inline">{product.brand}</dd></div>}{product.material && <div><dt className="inline font-semibold">Material: </dt><dd className="inline">{product.material}</dd></div>}</dl>
      <div><label htmlFor="produto-tamanho" className="mb-2 block text-sm font-semibold">Tamanho desejado</label><Select id="produto-tamanho" value={size} onChange={(event) => setSize(event.target.value)}><option value="">Selecione o tamanho</option>{product.sizes.map((value) => <option key={value} value={value} disabled={stockLimit(product, value) === 0}>{/^\d+$/.test(value) ? `${value} anos` : value}{stockLimit(product, value) === 0 ? " — Esgotado" : ""}</option>)}</Select></div>
      <div><label htmlFor="produto-estampa" className="mb-2 block text-sm font-semibold">Estampa desejada</label><Select id="produto-estampa" value={print} onChange={(event) => setPrint(event.target.value)}><option value="">Consultar estampas</option>{(product.prints ?? []).map((value) => <option key={value} value={value}>{value}</option>)}</Select></div>
      <p className="text-sm text-muted">Consulte tamanhos disponíveis. Atendimento em Uberlândia/MG. Entrega ou retirada a combinar.</p>
      <ActionLink href={`${store.whatsapp}?text=${encodeURIComponent(message)}`} className="w-full">Pedir pelo WhatsApp</ActionLink>
      <Button className="w-full" variant="secondary" disabled={busy || !stockLimit(product, size)} onClick={async () => {
        setBusy(true);
        try { const persisted = await add({ productId: product.id, size: size || "A consultar", print: print || "A consultar", quantity: 1 }); setNotice(persisted ? "Peça adicionada ao carrinho." : "Peça adicionada nesta aba. Seu navegador não permitiu salvar o carrinho para a próxima visita."); }
        catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível adicionar."); }
        finally { setBusy(false); }
      }}>Adicionar ao carrinho</Button>
      <p role="status" className="text-sm text-muted">{notice}</p>
      {notice && <ActionLink href="/carrinho" variant="secondary">Ver carrinho</ActionLink>}
    </div>
  </div>;
}
