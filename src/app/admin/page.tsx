import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AdminPanel } from "@/components/admin-panel";
export const metadata: Metadata = { title: "Administração | Dililu", robots: { index: false, follow: false } };
export default function AdminPage() {
  return <main id="conteudo" tabIndex={-1} className="py-10"><Container><h1 className="font-display text-4xl">Administração Dililu</h1><AdminPanel /></Container></main>;
}
