import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import catalog from "../data/catalogo.json" with { type: "json" };
import { prepareProducts } from "./seed-products.mjs";
import { createHandler } from "../services/catalog/handler.mjs";

// Requires an export built with the three *.test values documented in ADMIN.md.
// All remote API/auth requests are intercepted; no AWS calls or account required.
const { chromium } = await import(pathToFileURL(`${process.env.PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`).href);
const server = spawn(process.execPath, ["scripts/preview-static.mjs"], { stdio: ["ignore", "pipe", "pipe"] });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined });
try {
  await new Promise((resolve, reject) => { server.stdout.once("data", resolve); server.once("error", reject); server.once("exit", code => reject(new Error(`Preview stopped ${code}`))); });
  for (const width of [1440, 390]) {
    const items = new Map(prepareProducts(catalog).items.map(item => [item.productId, item]));
    let writes = 0, outage = false, challenge;
    const handler = createHandler({ list: async () => [...items.values()], get: async id => items.get(id), put: async item => { items.set(item.productId, item); writes++; } });
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 500 });
    const errors = [];
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await context.route("https://dililu-api.test/**", async route => {
      if (outage) { await route.fulfill({ status: 503, json: { message: "Offline" } }); return; }
      const request = route.request(), path = new URL(request.url()).pathname;
      const admin = path.startsWith("/admin");
      const detail = /\/products\/[^/]+$/.test(path);
      const auth = request.headers().authorization === "Bearer test-access" ? { token_use: "access", "cognito:groups": ["dililu-admin"] } : null;
      const result = await handler({ routeKey: `${request.method()} ${admin ? "/admin" : ""}/products${detail ? "/{id}" : ""}`, pathParameters: { id: path.split("/").at(-1) }, body: request.postData(), requestContext: { authorizer: { jwt: { claims: auth } } } });
      await route.fulfill({ status: result.statusCode, contentType: "application/json", body: result.body });
    });
    await context.route("https://dililu-auth.test/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname === "/oauth2/authorize") {
        assert.equal(url.searchParams.get("code_challenge_method"), "S256");
        assert.equal(url.searchParams.get("response_type"), "code");
        challenge = url.searchParams.get("code_challenge");
        await route.fulfill({ status: 302, headers: { location: `http://127.0.0.1:4173/admin?code=test-code&state=${url.searchParams.get("state")}` } });
      } else {
        const data = new URLSearchParams(route.request().postData());
        assert.equal(createHash("sha256").update(data.get("code_verifier")).digest("base64url"), challenge);
        await route.fulfill({ json: { access_token: "test-access", expires_in: 900 } });
      }
    });
    await page.goto("http://127.0.0.1:4173/admin", { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("button", { name: /^Editar / }).count(), 0);
    await page.getByRole("button", { name: "Entrar com segurança" }).click();
    await page.getByText("80 de 80 produtos", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => Object.values(localStorage).some(value => value.includes("test-access"))), false);
    await page.getByLabel("Pesquisar nome, referência ou categoria").fill("dililu-001");
    await page.getByRole("button", { name: "Editar dililu-001", exact: true }).click();
    await page.getByLabel("Preço (R$)", { exact: true }).fill("42.90");
    for (const [size, quantity] of Object.entries({ P: "0", M: "2", G: "0", GG: "0" })) await page.getByLabel(`Estoque ${size}`, { exact: true }).fill(quantity);
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await page.getByText("Produto salvo.", { exact: false }).waitFor();
    assert.equal(items.get("dililu-001").price, 42.9);
    assert.equal(writes, 1);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    items.get("dililu-002").status = "HIDDEN";
    await page.goto("http://127.0.0.1:4173/catalogo", { waitUntil: "networkidle" });
    assert.equal(await page.locator("article").count(), 79);
    await page.goto(`http://127.0.0.1:4173/produtos/${items.get("dililu-002").slug}`, { waitUntil: "networkidle" });
    await page.getByText("Produto indisponível.", { exact: true }).waitFor();
    await page.goto(`http://127.0.0.1:4173/produtos/${items.get("dililu-001").slug}`, { waitUntil: "networkidle" });
    assert(await page.getByRole("button", { name: "Adicionar ao carrinho" }).isDisabled());
    assert(await page.locator('#produto-tamanho option[value="G"]').isDisabled());
    await page.getByLabel("Tamanho desejado").selectOption("M");
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await page.getByRole("link", { name: "Ver carrinho", exact: true }).click();
    await page.getByRole("button", { name: /^Aumentar quantidade/ }).click();
    assert(await page.getByRole("button", { name: /^Aumentar quantidade/ }).isDisabled());
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("dililu.cart.v1"))[0].price), 42.9);
    let target;
    await context.route("https://wa.me/**", async route => { target = new URL(route.request().url()); await route.fulfill({ body: "WhatsApp intercepted" }); });
    await page.getByRole("link", { name: "Enviar pedido pelo WhatsApp" }).click();
    await page.waitForURL("https://wa.me/**");
    assert.equal(target.pathname, "/5534996419677");
    assert(target.searchParams.get("text").includes("42,90"));
    assert.equal(items.get("dililu-001").sizes.M, 2);
    assert.equal(writes, 1);
    items.get("dililu-001").sizes.M = 0;
    await page.goto(`http://127.0.0.1:4173/produtos/${items.get("dililu-001").slug}`, { waitUntil: "networkidle" });
    await page.getByText("Esgotado", { exact: true }).waitFor();
    assert(await page.getByRole("button", { name: "Adicionar ao carrinho" }).isDisabled());
    assert.deepEqual(errors, []);
    outage = true;
    await page.goto("http://127.0.0.1:4173/catalogo", { waitUntil: "networkidle" });
    await page.getByText("Catálogo temporariamente indisponível.", { exact: false }).waitFor();
    assert.equal(await page.locator("article").count(), 0);
    console.log(`Admin/store PASS ${width}px: PKCE, login gate, 80 records, edit price/stock, hidden, sold out, size/stock/cart, WhatsApp without stock decrement, outage blocks stale catalog`);
    await context.close();
  }
} finally { await browser.close(); server.kill(); }
