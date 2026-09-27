// Static Next.js export includes inline hydration scripts. A nonce requires
// request-time rendering; a stricter hash policy needs a post-build publisher.
export function contentSecurityPolicy(development = false, endpoints: string[] = []): string {
  const origins = endpoints.filter(Boolean).map(value => {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Endpoint público deve usar HTTPS.");
    return url.origin;
  });
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src 'self'${origins.length ? ` ${[...new Set(origins)].join(" ")}` : ""}${development ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "manifest-src 'self'",
  ].join("; ");
}
