import { ActionLink, Badge, Container, Panel, SectionHeading } from "@/components/ui";
import { store } from "@/lib/store";
import { categories } from "@/lib/catalog";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main id="conteudo" tabIndex={-1} className="py-12 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="max-w-2xl space-y-6">
          <Badge>Moda bebê e infantil</Badge>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">Pequenos momentos,<br />muito carinho.</h1>
          <p className="text-lg text-muted">Moda bebê e infantil para acompanhar a infância. Conheça as peças e converse com a gente para escolher tamanhos e estampas.</p>
          <div className="flex flex-wrap gap-3"><ActionLink href="/catalogo">Explorar o catálogo</ActionLink><ActionLink href={store.whatsapp} variant="secondary">Conversar pelo WhatsApp</ActionLink></div>
        </div>
        <aside className="rounded-card bg-lilac p-8 sm:p-12"><p className="mb-5 text-xs font-bold uppercase tracking-widest text-brand">Do bebê à infância</p><p className="font-display text-3xl">Cada fase tem seu encanto.</p><dl className="mt-8 space-y-4 text-sm"><div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4"><dt className="font-semibold">Moda bebê</dt><dd>P · M · G · GG</dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="font-semibold">Moda infantil</dt><dd>2 · 4 · 6 · 8 · 10 anos</dd></div></dl><p className="mt-6 text-xs text-muted">Consulte as opções e a disponibilidade de cada peça.</p></aside>
        </div>
        <section className="mt-16 space-y-6 sm:mt-24" aria-labelledby="categorias">
          <h2 id="categorias" className="font-display text-3xl sm:text-4xl">O que vamos encontrar hoje?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{categories.map((category) => <Link key={category.id} href={`/catalogo?categoria=${category.id}`} className="rounded-card border border-line bg-white p-5 text-sm font-semibold transition-colors hover:bg-lilac">{category.name}<span aria-hidden="true" className="ml-2">↗</span></Link>)}</div>
        </section>
        <section className="mt-16 space-y-6 sm:mt-24">
          <SectionHeading eyebrow="Um pouco da Dililu" title="Peças para conhecer" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.filter((product) => product.active).slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div>
          <ActionLink href="/catalogo" variant="secondary">Ver todas as peças</ActionLink>
        </section>
        {products.some((product) => product.active && product.newArrival) && <section className="mt-16 space-y-6"><SectionHeading title="Novidades" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.filter((product) => product.active && product.newArrival).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
        <section id="como-comprar" className="mt-16 space-y-6 sm:mt-24">
          <SectionHeading eyebrow="Como comprar" title="Uma conversa, uma escolha especial" />
          <div className="grid gap-4 md:grid-cols-3">{[{ title: "Conheça as peças", text: "Explore o catálogo e encontre o que combina com seu pequeno." }, { title: "Converse com a gente", text: "Confirme fotos, tamanhos, estampas e disponibilidade pelo WhatsApp." }, { title: "Combine os detalhes", text: "Pagamento via Pix. Consulte as opções de entrega ou retirada." }].map((step, index) => <Panel key={step.title}><p className="mb-5 text-sm font-bold text-brand">0{index + 1}</p><h3 className="mb-3 font-display text-2xl">{step.title}</h3><p className="text-sm text-muted">{step.text}</p></Panel>)}</div>
        </section>
        <section className="mt-16 flex flex-col items-start gap-6 rounded-card bg-peach p-8 sm:mt-24 sm:p-12"><SectionHeading eyebrow="@dililu.moda" title="Acompanhe a Dililu de pertinho"><p>Veja as novidades no Instagram e tire suas dúvidas com a gente pelo WhatsApp.</p></SectionHeading><div className="flex flex-wrap gap-3"><ActionLink href={store.instagram} variant="secondary">Visitar Instagram</ActionLink><ActionLink href={store.whatsapp}>Falar com a Dililu</ActionLink></div>
        </section>
      </Container>
    </main>
  );
}
