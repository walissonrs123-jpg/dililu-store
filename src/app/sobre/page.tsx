import type { Metadata } from "next";
import { ActionLink, Container, Panel } from "@/components/ui";
export const metadata: Metadata = { title: "Sobre a Dililu", alternates: { canonical: "/sobre" }, description: "Conheça a Dililu, moda bebê e infantil em Uberlândia/MG." };
export default function AboutPage() {
  return <main id="conteudo" tabIndex={-1} className="py-16"><Container className="max-w-3xl space-y-8"><h1 className="font-display text-4xl">Prazer, somos a Dililu.</h1><p className="text-lg text-muted">Moda bebê e infantil em Uberlândia/MG, com atendimento pelo WhatsApp para ajudar na escolha das peças.</p><Panel className="space-y-4"><h2 className="font-display text-2xl">De uma fase à outra</h2><p>Nosso catálogo reúne bodies, shorts, vestidos e conjuntos infantis. Consulte fotos, tecidos, tamanhos e estampas no atendimento.</p><p className="text-sm text-muted">Moda bebê: P, M, G e GG. Moda infantil: 2, 4, 6, 8 e 10 anos. A disponibilidade varia por peça e deve ser confirmada.</p></Panel><ActionLink href="/catalogo">Conhecer o catálogo</ActionLink></Container></main>;
}
