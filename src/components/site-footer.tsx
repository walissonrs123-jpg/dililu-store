import Link from "next/link";
import { Container } from "@/components/ui";
import { store } from "@/lib/store";

export function SiteFooter() {
  return <footer id="atendimento" className="mt-auto border-t border-line bg-lilac py-12">
    <Container>
      <div className="grid gap-8 sm:grid-cols-3">
        <div className="space-y-3"><p className="font-display text-3xl text-brand">Dililu</p><p className="max-w-xs text-sm text-muted">Moda bebê e infantil em {store.location}.</p></div>
        <div className="space-y-3"><h2 className="text-sm font-bold">Vamos conversar?</h2><Link href={store.whatsapp} className="block w-fit py-1 text-sm underline underline-offset-4">WhatsApp {store.whatsappLabel}</Link><Link href={store.instagram} className="block w-fit py-1 text-sm underline underline-offset-4">Instagram {store.instagramLabel}</Link></div>
        <div className="space-y-3"><h2 className="text-sm font-bold">Sua compra</h2><p className="text-sm text-muted">Pagamento via Pix. Confirme disponibilidade e opções de entrega ou retirada no atendimento.</p></div>
      </div>
      <nav aria-label="Institucional" className="mt-8 flex flex-wrap gap-6 text-sm underline underline-offset-4"><Link href="/sobre">Sobre a Dililu</Link><Link href="/como-comprar">Como comprar</Link><Link href="/contato">Contato</Link></nav>
      <p className="mt-10 border-t border-line pt-5 text-xs text-muted">Dililu · Moda bebê e infantil</p>
    </Container>
  </footer>;
}
