import type { MetadataRoute } from "next";
import { store } from "@/lib/store";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/carrinho"] }, sitemap: `${store.url}/sitemap.xml` };
}
