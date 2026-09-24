"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionLink, Button, Select } from "@/components/ui";
import { formatPrice, type Product } from "@/lib/catalog";
import { store } from "@/lib/store";

export function ProductDetails({ product }: { product: Product }) {
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [print, setPrint] = useState("");
  const message = `Olá, Dililu! Tenho interesse em ${product.name}. Tamanho: ${size || "a consultar"}. Estampa: ${print || "a consultar"}. Preço: ${formatPrice(product.price)}. Pode confirmar a disponibilidade e as opções de entrega ou retirada?`;
  return <div className="mt-8 grid gap-10 lg:grid-cols-2">
    <div>
      {product.images[image] ? <Image src={product.images[image]} width={800} height={960} alt={`${product.name} — foto ${image + 1}`} className="aspect-[5/6] w-full rounded-card bg-mint object-contain" priority /> : <div className="flex aspect-[5/4] items-center justify-center rounded-card bg-mint p-10 text-center text-muted">Fotos desta peça disponíveis mediante consulta pelo WhatsApp.</div>}
      {product.images.length > 1 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Fotos do produto">{product.images.map((source, index) => <Button key={source} variant="secondary" aria-pressed={index === image} onClick={() => setImage(index)}>Foto {index + 1}</Button>)}</div>}
    </div>
    <div className="space-y-6">
      <h1 className="font-display text-4xl leading-tight">{product.name}</h1>
      <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
      <p className="text-muted">{product.description || product.shortDescription}</p>
      <dl className="space-y-2 text-sm">{product.brand && <div><dt className="inline font-semibold">Marca: </dt><dd className="inline">{product.brand}</dd></div>}{product.material && <div><dt className="inline font-semibold">Material: </dt><dd className="inline">{product.material}</dd></div>}</dl>
      <div><label htmlFor="produto-tamanho" className="mb-2 block text-sm font-semibold">Tamanho desejado</label><Select id="produto-tamanho" value={size} onChange={(event) => setSize(event.target.value)}><option value="">Consultar tamanho</option>{product.sizes.map((value) => <option key={value} value={value}>{/^\d+$/.test(value) ? `${value} anos` : value}</option>)}</Select></div>
      <div><label htmlFor="produto-estampa" className="mb-2 block text-sm font-semibold">Estampa desejada</label><Select id="produto-estampa" value={print} onChange={(event) => setPrint(event.target.value)}><option value="">Consultar estampas</option>{(product.prints ?? []).map((value) => <option key={value} value={value}>{value}</option>)}</Select></div>
      <p className="text-sm text-muted">Tamanhos de referência. Confirme disponibilidade, estampas e entrega ou retirada antes de concluir a compra. Pagamento via Pix.</p>
      <ActionLink href={`${store.whatsapp}?text=${encodeURIComponent(message)}`} className="w-full">Consultar pelo WhatsApp</ActionLink>
    </div>
  </div>;
}
