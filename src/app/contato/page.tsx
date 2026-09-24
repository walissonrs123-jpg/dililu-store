import type { Metadata } from "next";
import { ActionLink, Container, Panel } from "@/components/ui";
import { store } from "@/lib/store";
export const metadata: Metadata = { title: "Contato | Dililu", alternates: { canonical: "/contato" }, description: "Fale com a Dililu pelo WhatsApp ou Instagram. Atendimento em Uberlândia/MG." };
export default function ContactPage() {
  return <main id="conteudo" tabIndex={-1} className="py-16"><Container className="max-w-3xl space-y-8"><h1 className="font-display text-4xl">Vamos conversar?</h1><p className="text-lg text-muted">Consulte fotos, tamanhos, estampas, disponibilidade e opções de entrega ou retirada.</p><Panel className="space-y-5"><h2 className="font-display text-2xl">Dililu · {store.location}</h2><p>WhatsApp: {store.whatsappLabel}<br />Instagram: {store.instagramLabel}</p><div className="flex flex-wrap gap-3"><ActionLink href={store.whatsapp}>Abrir WhatsApp</ActionLink><ActionLink href={store.instagram} variant="secondary">Abrir Instagram</ActionLink></div></Panel></Container></main>;
}
