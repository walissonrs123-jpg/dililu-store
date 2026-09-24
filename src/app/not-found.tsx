import { ActionLink, Container } from "@/components/ui";

export default function NotFound() {
  return <main id="conteudo" tabIndex={-1} className="py-20">
    <Container className="space-y-6">
      <p className="text-sm font-bold text-brand">404</p>
      <h1 className="font-display text-4xl">Esta página não foi encontrada.</h1>
      <p className="text-muted">Explore o catálogo para continuar com a Dililu.</p>
      <ActionLink href="/catalogo">Voltar ao catálogo</ActionLink>
    </Container>
  </main>;
}
