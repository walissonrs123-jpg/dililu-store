import Image from "next/image";

export function BrandLogo({ decorative = false, priority = false, className = "h-24 w-24" }: { decorative?: boolean; priority?: boolean; className?: string }) {
  return <Image src="/brand/logo-dililu.png" alt={decorative ? "" : "Dililu — Boutique infantil"} width={128} height={128} priority={priority} className={`shrink-0 object-contain ${className}`} />;
}
