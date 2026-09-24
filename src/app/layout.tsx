import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dililu | Moda bebê e infantil",
  description: "Moda bebê e infantil em Uberlândia/MG. Fale com a Dililu pelo WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
