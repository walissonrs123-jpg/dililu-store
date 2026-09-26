import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { products } from "../src/data/products.ts";

const { chromium } = await import(pathToFileURL(`${process.env.PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`).href);
const base = process.env.SITE_URL || "https://deagwveviqeg7.cloudfront.net";
assert(["https://deagwveviqeg7.cloudfront.net", "https://dililu.sofbrasil.com.br", "http://127.0.0.1:4173"].includes(base), "Unexpected validation host");
const sample = products[0];
const unknown = products.find(product => product.price === null);
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined });
try {
  const request = await browser.newContext();
  for (const product of products) {
    const photo = await request.request.head(base + product.image);
    assert.equal(photo.status(), 200, product.image);
    assert.match(photo.headers()["content-type"], /^image\//);
    const detail = await request.request.get(base + "/produtos/" + product.slug);
    assert.equal(detail.status(), 200, product.slug);
    const html = await detail.text();
    const whatsappLinks = html.match(/href="https:\/\/wa\.me\/[^"]+/g) || [];
    assert(whatsappLinks.length > 0, "WhatsApp CTA missing");
    for (const link of whatsappLinks) assert.match(link, /^href="https:\/\/wa\.me\/5534996419677(?:\?|$)/);
  }
  await request.close();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(`${message.text()} ${message.location().url}`); });
    const checkWidth = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Horizontal overflow");
    const home = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(home.status(), 200, "Home HTTP");
    await page.locator("h1").waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('header img')].some(img => img.complete && img.naturalWidth > 0));
    await checkWidth();
    await page.locator('header a[href="/catalogo"]').click();
    await page.getByLabel("Buscar uma peça").waitFor();
    assert.equal(await page.locator("article").count(), 80);
    for (const [category, count] of Object.entries({ bodies: 15, "shorts-bebe": 8, "shorts-infantil": 10, vestidos: 7, "conjuntos-femininos": 30, "conjuntos-masculinos": 10 })) {
      await page.getByLabel("Categoria", { exact: true }).selectOption(category);
      await page.waitForFunction(expected => document.querySelectorAll("article").length === expected, count);
    }
    await page.getByLabel("Categoria", { exact: true }).selectOption("");
    await page.getByLabel("Buscar uma peça").fill(sample.name);
    await page.waitForFunction(() => document.querySelectorAll("article").length === 1);
    assert.equal(await page.getByText("Foto do produto em breve", { exact: true }).count(), 0);
    assert.equal(await page.locator("article img").evaluate(img => getComputedStyle(img).objectFit), "contain");
    for (const href of await page.locator('a[href^="https://wa.me/"]').evaluateAll(links => links.map(a => a.href))) assert.equal(new URL(href).pathname, "/5534996419677");
    await page.getByRole("link", { name: "Ver detalhes", exact: true }).click();
    await page.getByRole("heading", { name: sample.name, exact: true }).waitFor();
    await page.getByLabel("Tamanho desejado").selectOption("M");
    assert.equal(await page.getByLabel("Tamanho desejado").inputValue(), "M");
    await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
    await page.getByRole("link", { name: "Ver carrinho", exact: true }).click();
    await page.getByText("Tamanho: M", { exact: false }).waitFor();
    await page.getByRole("button", { name: `Aumentar quantidade de ${sample.name}`, exact: true }).click();
    await page.getByLabel("Quantidade: 2", { exact: true }).waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByLabel("Quantidade: 2", { exact: true }).waitFor();
    const whatsapp = page.getByRole("link", { name: "Enviar pedido pelo WhatsApp", exact: true });
    const target = new URL(await whatsapp.getAttribute("href"));
    assert.equal(target.origin, "https://wa.me");
    assert.equal(target.pathname, "/5534996419677");
    assert(target.searchParams.get("text").includes(sample.name));
    assert.match(target.searchParams.get("text"), /M/);
    // Intercept external navigation: exercise button without sending any message.
    let clicked = false;
    await context.route("https://wa.me/**", async route => { clicked = true; await route.fulfill({ status: 200, contentType: "text/html", body: "WhatsApp destination checked" }); });
    await whatsapp.click();
    await page.waitForURL("https://wa.me/**");
    assert(clicked, "WhatsApp navigation");
    for (const route of ["/catalogo", "/catalogo/", `/produtos/${sample.slug}`, `/produtos/${sample.slug}/`, "/produtos/body-mbaby", "/carrinho"]) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, `Direct route ${route}`);
      await checkWidth();
    }
    await page.goto(base + "/produtos/" + unknown.slug, { waitUntil: "networkidle" });
    await page.getByText("Consulte o valor", { exact: true }).first().waitFor();
    await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
    await page.getByRole("link", { name: "Ver carrinho", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("strong")?.textContent === "Consulte o valor");
    const logo = await context.request.get(base + "/brand/logo-dililu.png");
    assert.equal(logo.status(), 200);
    assert.match(logo.headers()["content-type"], /image\/png/);
    assert.deepEqual(errors, [], "Browser console/runtime errors");
    console.log(`Functional PASS ${viewport.width}px: 80 products/photos, category counts, price on request, size, mixed cart, WhatsApp, logo, direct/legacy routes, layout`);
    await context.close();
  }
} finally {
  await browser.close();
}
