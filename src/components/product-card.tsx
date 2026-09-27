import Image from "next/image";
import { ActionLink } from "@/components/ui";
import { categories, productPrice, type Product } from "@/lib/catalog";
import { store } from "@/lib/store";
import { ProductPlaceholder } from "@/components/product-placeholder";

export function ProductCard({ product }: { product: Product }) {
  const message = `Olá Dililu! Tenho interesse no produto: ${product.name}. Gostaria de consultar tamanhos disponíveis.`;
  return <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-white">
    {product.images[0] ? <Image src={product.images[0]} alt={product.name} width={600} height={720} className="aspect-[5/6] w-full object-contain" /> : <ProductPlaceholder />}
    <div className="flex flex-1 flex-col gap-3 p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand">{categories.find((item) => item.id === product.categoryId)?.name}</p>
      <h2 className="font-display text-2xl leading-tight">{product.name}</h2>
      <p className="text-sm text-muted">{product.shortDescription}</p>
      <p className="text-xl font-semibold">{productPrice(product)}</p>
      {product.stockMode === "unavailable" && <p className="font-semibold text-brand">Esgotado</p>}
      <p className="text-xs text-muted">{product.sizes.length ? `Tamanhos de referência: ${product.sizes.join(", ")}.` : "Tamanhos a consultar."} Consulte tamanhos disponíveis</p>
      <ActionLink className="mt-auto w-full" variant="secondary" href={`/produtos/${product.slug}`}>Ver detalhes</ActionLink>
      <a className="py-2 text-center text-sm text-brand underline underline-offset-4" href={`${store.whatsapp}?text=${encodeURIComponent(message)}`}>Pedir pelo WhatsApp</a>
    </div>
  </article>;
}
