import Link from "next/link";
import { ActionLink, Container } from "@/components/ui";
import { store } from "@/lib/store";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return <header className="border-b border-line bg-paper">
    <div className="bg-mint py-2 text-center text-xs font-medium">Moda bebê e infantil · {store.location}</div>
    <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5">
      <Link href="/" aria-label="Dililu — início" className="shrink-0 rounded-full"><BrandLogo priority className="h-24 w-24 sm:h-28 sm:w-28" /></Link>
      <nav aria-label="Navegação principal" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-1 text-sm font-semibold sm:order-none sm:w-auto">
        <Link href="/" className="py-2 hover:text-brand">Início</Link>
        <Link href="/catalogo" className="py-2 hover:text-brand">Catálogo</Link>
        <Link href="/carrinho" className="py-2 hover:text-brand">Carrinho</Link>
        <Link href="/como-comprar" className="py-2 hover:text-brand">Como comprar</Link>
        <Link href="/contato" className="py-2 hover:text-brand">Atendimento</Link>
      </nav>
      <ActionLink href={store.whatsapp} variant="secondary">Fale com a gente</ActionLink>
    </Container>
  </header>;
}
