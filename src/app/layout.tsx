import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { store } from "@/lib/store";
import { contentSecurityPolicy } from "@/lib/csp";
import { CatalogProvider } from "@/components/catalog-provider";
import { adminConfig } from "@/lib/admin-config";

export const metadata: Metadata = {
  metadataBase: new URL(store.url),
  icons: { icon: "/brand/logo-dililu.png" },
  title: "Dililu | Moda bebê e infantil",
  description: "Moda bebê e infantil em Uberlândia/MG. Fale com a Dililu pelo WhatsApp.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Dililu", title: "Dililu | Moda bebê e infantil", description: "Conheça as peças e consulte tamanhos e disponibilidade pelo WhatsApp." },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy(process.env.NODE_ENV === "development", [adminConfig.apiUrl, adminConfig.cognitoDomain])} /></head><body className="flex min-h-screen flex-col"><CatalogProvider>
    <a href="#conteudo" className="skip-link rounded-xl bg-brand px-5 py-3 text-white">Pular para o conteúdo</a>
    <SiteHeader />
    {children}
    <SiteFooter />
  </CatalogProvider></body></html>;
}
