import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { Container, SectionHeading } from "@/components/ui";
import { ProductDetails } from "@/components/product-details";
import { ProductCard } from "@/components/product-card";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.filter((product) => product.active).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.active && item.slug === slug);
  return product ? { title: `${product.name} | Dililu`, description: product.shortDescription, alternates: { canonical: `/produtos/${slug}` } } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.active && item.slug === slug);
  if (!product) notFound();
  const related = products.filter((item) => item.active && item.id !== product.id && (item.audience === product.audience || item.category === product.category)).slice(0, 3);
  return <main id="conteudo" tabIndex={-1} className="py-10 sm:py-16"><Container>
    <nav aria-label="Caminho da página" className="text-sm text-muted"><Link href="/catalogo" className="underline underline-offset-4">Catálogo</Link><span aria-hidden="true"> / </span><span>{product.name}</span></nav>
    <ProductDetails product={product} />
    {related.length > 0 && <section className="mt-16 space-y-6"><SectionHeading title="Conheça também" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
  </Container></main>;
}
