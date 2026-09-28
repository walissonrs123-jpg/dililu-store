import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import { products } from "../src/data/products.ts";
import { categories } from "../src/lib/catalog.ts";

const { chromium } = await import(pathToFileURL(`${process.env.PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`).href);
const base = "http://127.0.0.1:4173";
await mkdir(".local/catalog-ux", { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 500, hasTouch: width < 500 });
    // Serve original metadata locally even when the build has a public API URL.
    // Never contact the production API or send messages.
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin === base) return route.continue();
      if (url.pathname === "/products") return route.fulfill({ json: { products: products.map(product => ({
        productId: product.id, name: product.name, reference: product.reference || product.id,
        categoryId: product.categoryId, price: product.price, priceOnRequest: product.price === null,
        status: "ACTIVE", sizes: Object.fromEntries(product.sizes.map(size => [size, null])),
        image: product.image, slug: product.slug, version: 1,
      })) } });
      return route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const count = n => page.waitForFunction(expected => document.querySelectorAll("article").length === expected, n);
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.getByText("O que vamos encontrar hoje?", { exact: true }).count(), 0);
    await page.goto(`${base}/catalogo`, { waitUntil: "networkidle" });
    await count(80);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const mobile = width < 500;
    const trigger = page.getByRole("button", { name: "Filtros", exact: true });
    if (mobile) {
      await trigger.click();
      assert.equal(await trigger.getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("#mobile-busca").evaluate(el => document.activeElement === el), true);
      await page.keyboard.press("Escape");
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
      await trigger.click();
    } else {
      assert.equal((await page.locator("aside").boundingBox()).width, 280);
    }
    const panel = page.locator(mobile ? "dialog" : "aside");
    const search = panel.getByRole("searchbox");
    for (const query of ["short", "Short", "SHORT"]) { await search.fill(query); await count(18); }
    await panel.getByLabel(categories.find(c => c.id === "shorts-infantil").name, { exact: true }).check();
    await count(10);
    await panel.getByLabel("4 anos", { exact: true }).check();
    await panel.getByRole("button", { name: "Tamanho 4", exact: true }).click();
    await panel.getByLabel("Unissex", { exact: true }).check();
    await count(10);
    assert(new URL(page.url()).searchParams.has("size"));
    await panel.getByRole("button", { name: "Limpar filtros", exact: true }).click();
    await count(80);
    await search.fill("LEAOZINHO masculino");
    await count(1);
    await panel.getByRole("button", { name: "Limpar filtros", exact: true }).click();
    await count(80);
    if (mobile) {
      await page.screenshot({ path: `.local/catalog-ux/${width}-filters.png` });
      await page.getByRole("button", { name: "Fechar filtros", exact: true }).click();
    }
    await page.getByLabel("Ordenar por", { exact: true }).selectOption("price-desc");
    if (mobile) await trigger.click();
    await panel.getByRole("button", { name: "Limpar filtros", exact: true }).click();
    assert.equal(await page.getByLabel("Ordenar por", { exact: true }).inputValue(), "name");
    if (mobile) await page.getByRole("button", { name: "Fechar filtros", exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.local/catalog-ux/${width}.png` });
    await page.goto(`${base}/catalogo?categoria=shorts-bebe`, { waitUntil: "networkidle" });
    await count(8);
    await page.reload({ waitUntil: "networkidle" });
    await count(8);
    const sample = products[0];
    await page.goto(`${base}/produtos/${sample.slug}`, { waitUntil: "networkidle" });
    await page.getByLabel("Tamanho desejado").selectOption("M");
    await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
    await page.getByRole("link", { name: "Ver carrinho", exact: true }).click();
    await page.getByText("Tamanho: M", { exact: false }).waitFor();
    const link = await page.getByRole("link", { name: "Enviar pedido pelo WhatsApp", exact: true }).getAttribute("href");
    assert(new URL(link).searchParams.get("text").includes(sample.name));
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: search, categories, age, size, gender, combinations, reset, URL, cart, layout`);
    await context.close();
  }
} finally { await browser.close(); }
