import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Catálogo | Dililu", alternates: { canonical: "/catalogo" } };

export default function CatalogPage() {
  return <main id="conteudo" tabIndex={-1} className="py-10 sm:py-16">
    <Container>
      <Suspense fallback={<p className="py-8" role="status">Carregando catálogo…</p>}><Catalog /></Suspense>
    </Container>
  </main>;
}
