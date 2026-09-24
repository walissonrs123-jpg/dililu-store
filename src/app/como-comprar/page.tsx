import type { Metadata } from "next";
import { ActionLink, Container, Panel } from "@/components/ui";
import { store } from "@/lib/store";
export const metadata: Metadata = { title: "Como comprar | Dililu", alternates: { canonical: "/como-comprar" }, description: "Escolha as peças e envie seu carrinho pelo WhatsApp. Confirme disponibilidade e entrega ou retirada." };
export default function HowToBuyPage() {
  const steps = [
    ["Escolha suas peças", "Use os filtros do catálogo, abra os detalhes e indique tamanho e estampa desejados. Quando não souber, deixe a opção a consultar."],
    ["Confira o carrinho", "Ajuste as quantidades e confira o subtotal. O carrinho fica salvo neste navegador, quando o armazenamento local está disponível."],
    ["Envie pelo WhatsApp", "O botão prepara uma mensagem com sua seleção. Envie a mensagem para iniciar o atendimento; isso ainda não confirma a compra."],
    ["Combine com a Dililu", "Confirme disponibilidade, fotos, estampas e opções/valores de entrega ou retirada. O pagamento confirmado é Pix."],
  ];
  return <main id="conteudo" tabIndex={-1} className="py-16"><Container className="max-w-3xl space-y-8"><h1 className="font-display text-4xl">Como comprar</h1><ol className="space-y-4">{steps.map(([title, text], index) => <li key={title}><Panel><p className="mb-3 text-sm font-bold text-brand">Passo {index + 1}</p><h2 className="mb-3 font-display text-2xl">{title}</h2><p className="text-muted">{text}</p></Panel></li>)}</ol><ActionLink href={store.whatsapp}>Tirar uma dúvida</ActionLink></Container></main>;
}
