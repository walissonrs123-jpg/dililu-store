import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Dililu | Moda bebê e infantil",
  description: "Moda bebê e infantil em Uberlândia/MG. Fale com a Dililu pelo WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="flex min-h-screen flex-col">
    <a href="#conteudo" className="skip-link rounded-xl bg-brand px-5 py-3 text-white">Pular para o conteúdo</a>
    <SiteHeader />
    {children}
    <SiteFooter />
  </body></html>;
}
