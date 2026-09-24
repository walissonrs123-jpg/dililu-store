import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Cart } from "@/components/cart";

export const metadata: Metadata = { title: "Carrinho | Dililu", robots: { index: false, follow: true } };
export default function CartPage() {
  return <main id="conteudo" tabIndex={-1} className="py-12"><Container><h1 className="font-display text-4xl">Seu carrinho</h1><Cart /></Container></main>;
}
