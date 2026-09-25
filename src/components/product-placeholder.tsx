import { BrandLogo } from "@/components/brand-logo";

// This is a brand placeholder, never a representation of a product.
// Keep Product.images empty until real product photos are supplied.
export function ProductPlaceholder({ className = "" }: { className?: string }) {
  return <div className={`flex aspect-[5/6] w-full flex-col items-center justify-center gap-5 bg-paper p-8 text-center ${className}`}>
    <BrandLogo decorative className="h-24 w-24" />
    <div className="max-w-56 space-y-2">
      <p className="text-sm font-semibold text-ink">Foto do produto em breve</p>
      <p className="text-sm text-muted">Consulte os detalhes da peça pelo WhatsApp.</p>
    </div>
  </div>;
}
