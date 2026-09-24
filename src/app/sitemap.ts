import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { store } from "@/lib/store";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/catalogo", "/sobre", "/como-comprar", "/contato", ...products.filter((product) => product.active).map((product) => `/produtos/${product.slug}`)].map((path) => ({ url: `${store.url}${path}`, changeFrequency: "weekly" }));
}
