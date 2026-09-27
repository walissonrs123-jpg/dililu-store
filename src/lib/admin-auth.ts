import { adminConfig } from "./admin-config";
const key = "dililu.pkce";
const base64url = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const callback = () => `${window.location.origin}/admin`;
export async function login() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  sessionStorage.setItem(key, JSON.stringify({ verifier, state, created: Date.now() }));
  const url = new URL("/oauth2/authorize", adminConfig.cognitoDomain);
  url.search = new URLSearchParams({ response_type: "code", client_id: adminConfig.clientId, redirect_uri: callback(), scope: "openid email", state, code_challenge: challenge, code_challenge_method: "S256" }).toString();
  window.location.assign(url);
}
let pending: Promise<{ token: string; expiresAt: number } | null> | undefined;
export function finishLogin() {
  // React strict-mode must not exchange a single-use authorization code twice.
  return pending ??= (async () => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    if (!code && !query.has("error")) return null;
    const saved = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    window.history.replaceState({}, "", "/admin");
    if (!saved || !code) throw new Error("Login não concluído. Tente novamente.");
    const proof = JSON.parse(saved);
    if (proof.state !== query.get("state") || Date.now() - proof.created > 600000) throw new Error("Sessão de login inválida ou expirada.");
    const response = await fetch(`${adminConfig.cognitoDomain}/oauth2/token`, { method: "POST", credentials: "omit", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", client_id: adminConfig.clientId, code, redirect_uri: callback(), code_verifier: proof.verifier }) });
    if (!response.ok) throw new Error("Falha na autenticação.");
    const result = await response.json();
    if (!result.access_token || !Number.isFinite(result.expires_in)) throw new Error("Resposta de autenticação inválida.");
    return { token: result.access_token as string, expiresAt: Date.now() + result.expires_in * 1000 };
  })();
}
export function logout() {
  pending = undefined;
  sessionStorage.removeItem(key);
  const url = new URL("/logout", adminConfig.cognitoDomain);
  url.search = new URLSearchParams({ client_id: adminConfig.clientId, logout_uri: callback() }).toString();
  window.location.assign(url);
}
