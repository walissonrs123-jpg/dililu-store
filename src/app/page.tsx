import { ActionLink, Badge, Container, Panel, SectionHeading } from "@/components/ui";
import { store } from "@/lib/store";

export default function Home() {
  return (
    <main id="conteudo" tabIndex={-1} className="py-12 sm:py-20">
      <Container>
        <div className="max-w-2xl space-y-6">
          <Badge>Moda bebê e infantil</Badge>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">Pequenos momentos,<br />muito carinho.</h1>
          <p className="text-lg text-muted">Nosso catálogo está em preparação. Converse com a Dililu para conhecer as peças e consultar tamanhos.</p>
          <ActionLink href={store.whatsapp}>Conversar pelo WhatsApp</ActionLink>
        </div>
        <section id="como-comprar" className="mt-16 space-y-6 sm:mt-24">
          <SectionHeading eyebrow="Perto de você" title="Atendimento com carinho" />
          <Panel><p className="max-w-2xl text-muted">Tire suas dúvidas pelo WhatsApp, confirme a disponibilidade e combine as opções de entrega ou retirada em {store.location}. Pagamento via Pix.</p></Panel>
        </section>
      </Container>
    </main>
  );
}
