import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(pathToFileURL(`${process.env.PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`).href);
const base = "https://deagwveviqeg7.cloudfront.net";
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const checkWidth = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Horizontal overflow");
    const home = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(home.status(), 200, "Home HTTP");
    await page.locator("h1").waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('header img')].some(img => img.complete && img.naturalWidth > 0));
    await checkWidth();
    await page.locator('header a[href="/catalogo"]').click();
    await page.getByLabel("Buscar uma peça").waitFor();
    await page.getByLabel("Buscar uma peça").fill("Body");
    await page.waitForFunction(() => document.querySelectorAll("article").length === 1);
    assert.equal(await page.getByText("Foto do produto em breve", { exact: true }).count(), 1);
    await page.getByRole("link", { name: "Ver detalhes", exact: true }).click();
    await page.getByRole("heading", { name: "Body M Baby", exact: true }).waitFor();
    await page.getByLabel("Tamanho desejado").selectOption("M");
    assert.equal(await page.getByLabel("Tamanho desejado").inputValue(), "M");
    await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
    await page.getByRole("link", { name: "Ver carrinho", exact: true }).click();
    await page.getByText("Tamanho: M", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Aumentar quantidade de Body M Baby", exact: true }).click();
    await page.getByLabel("Quantidade: 2", { exact: true }).waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByLabel("Quantidade: 2", { exact: true }).waitFor();
    const whatsapp = page.getByRole("link", { name: "Enviar pedido pelo WhatsApp", exact: true });
    const target = new URL(await whatsapp.getAttribute("href"));
    assert.equal(target.origin, "https://wa.me");
    assert.equal(target.pathname, "/5534996419677");
    assert.match(target.searchParams.get("text"), /Body M Baby/);
    assert.match(target.searchParams.get("text"), /M/);
    // Intercept external navigation: exercise button without sending any message.
    let clicked = false;
    await context.route("https://wa.me/**", async route => { clicked = true; await route.fulfill({ status: 200, contentType: "text/html", body: "WhatsApp destination checked" }); });
    await whatsapp.click();
    await page.waitForURL("https://wa.me/**");
    assert(clicked, "WhatsApp navigation");
    for (const route of ["/catalogo", "/catalogo/", "/produtos/body-mbaby", "/produtos/body-mbaby/", "/carrinho"]) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, `Direct route ${route}`);
      await checkWidth();
    }
    const logo = await context.request.get(base + "/brand/logo-dililu.png");
    assert.equal(logo.status(), 200);
    assert.match(logo.headers()["content-type"], /image\/png/);
    assert.deepEqual(errors, [], "Browser console/runtime errors");
    console.log(`Functional PASS ${viewport.width}px: Home, catalog, product, size, cart persistence/quantity, WhatsApp, logo/placeholders, direct routes, layout`);
    await context.close();
  }
} finally {
  await browser.close();
}
