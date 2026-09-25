import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { filterProducts, initialFilters } from "../src/lib/catalog.ts";
import { products } from "../src/data/products.ts";

test("busca ignora acentos e combina palavras", () => {
  const result = filterProducts(products, { ...initialFilters, query: "  ALGODAO feminino " });
  assert.deepEqual(result.map((item) => item.id), ["conjunto-jennynha-feminino"]);
});

test("categoria, público e tamanho são combinados sem inventar disponibilidade", () => {
  const result = filterProducts(products, { ...initialFilters, category: "bodies", audience: "bebe", size: "M" });
  assert.equal(result.length, 1);
  assert.equal(result[0].stockMode, "consult");
  assert.equal(filterProducts(products, { ...initialFilters, category: "bodies", size: "10" }).length, 0);
  assert.equal(filterProducts(products, { ...initialFilters, category: "kits" }).length, 0);
});

test("ordenação numérica preserva a ordem original do catálogo", () => {
  const original = products.map((item) => item.id);
  const ascending = filterProducts(products, { ...initialFilters, sort: "price-asc" });
  assert.equal(ascending[0].price, 19.9);
  assert.equal(ascending.at(-1).price, 64.9);
  assert.equal(filterProducts(products, { ...initialFilters, sort: "price-desc" })[0].price, 64.9);
  assert.deepEqual(products.map((item) => item.id), original);
});

test("produtos desativados não são expostos", () => {
  assert.deepEqual(filterProducts([{ ...products[0], active: false }], initialFilters), []);
});

test("catálogo mantém IDs únicos, preços válidos e referências a fotos locais existentes", async () => {
  assert.equal(new Set(products.map((item) => item.id)).size, products.length);
  for (const product of products) {
    assert.equal(Number.isFinite(product.price) && product.price > 0, true);
    for (const image of product.images) {
      assert.match(image, /^\/products\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|avif)$/i);
      assert.equal(image.split("/").includes(".."), false);
      await access(new URL(`../public${image}`, import.meta.url));
    }
  }
});
