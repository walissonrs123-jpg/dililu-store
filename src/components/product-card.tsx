import Image from "next/image";
import { ActionLink } from "@/components/ui";
import { categories, formatPrice, type Product } from "@/lib/catalog";
import { store } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const message = `Olá, Dililu! Gostaria de consultar ${product.name} (${formatPrice(product.price)}). Pode enviar fotos e confirmar tamanhos, estampas e disponibilidade?`;
  return <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-white">
    {product.images[0] ? <Image src={product.images[0]} alt={product.name} width={600} height={720} className="aspect-[5/6] w-full object-contain" /> : <div className="flex aspect-[5/4] items-center justify-center bg-mint p-8 text-center"><p className="max-w-44 text-sm text-muted">Consulte a foto da peça pelo WhatsApp.</p></div>}
    <div className="flex flex-1 flex-col gap-3 p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand">{categories.find((item) => item.id === product.category)?.name}</p>
      <h2 className="font-display text-2xl leading-tight">{product.name}</h2>
      <p className="text-sm text-muted">{product.shortDescription}</p>
      <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
      <p className="text-xs text-muted">{product.sizes.length ? `Tamanhos de referência: ${product.sizes.join(", ")}.` : "Tamanhos a consultar."} Disponibilidade sob consulta.</p>
      <ActionLink className="mt-auto w-full" variant="secondary" href={`/produtos/${product.slug}`}>Ver detalhes</ActionLink>
      <a className="py-2 text-center text-sm text-brand underline underline-offset-4" href={`${store.whatsapp}?text=${encodeURIComponent(message)}`}>Consultar pelo WhatsApp</a>
    </div>
  </article>;
}
