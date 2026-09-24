import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Catálogo | Dililu", alternates: { canonical: "/catalogo" } };

export default function CatalogPage() {
  return <main id="conteudo" tabIndex={-1} className="py-10 sm:py-16">
    <Container>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">Moda bebê e infantil</p>
      <h1 className="font-display text-4xl sm:text-5xl">Encontre uma peça especial.</h1>
      <p className="mt-4 max-w-2xl text-muted">Explore as categorias e consulte as opções pelo WhatsApp. Entrega ou retirada a combinar no atendimento.</p>
      <Suspense fallback={<p className="py-8" role="status">Carregando catálogo…</p>}><Catalog /></Suspense>
    </Container>
  </main>;
}
