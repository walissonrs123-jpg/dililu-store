import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { filterProducts, initialFilters } from "../src/lib/catalog.ts";
import { products } from "../src/data/products.ts";

test("busca ignora acentos e combina palavras", () => {
  const result = filterProducts(products, { ...initialFilters, query: "  LEAOZINHO masculino " });
  assert.deepEqual(result.map((item) => item.id), ["dililu-002"]);
});

test("categoria, público e tamanho são combinados sem inventar disponibilidade", () => {
  const result = filterProducts(products, { ...initialFilters, category: "bodies", audience: "bebe", size: "M" });
  assert.equal(result.length, 15);
  assert.equal(result[0].stockMode, "consult");
  assert.equal(filterProducts(products, { ...initialFilters, category: "bodies", size: "10" }).length, 0);
  assert.equal(filterProducts(products, { ...initialFilters, category: "kits" }).length, 0);
});

test("ordenação numérica preserva a ordem original do catálogo", () => {
  const original = products.map((item) => item.id);
  const ascending = filterProducts(products, { ...initialFilters, sort: "price-asc" });
  assert.equal(ascending[0].price, 19.9);
  assert.equal(ascending.at(-1).price, null);
  assert.equal(filterProducts(products, { ...initialFilters, sort: "price-desc" })[0].price, 34.9);
  assert.deepEqual(products.map((item) => item.id), original);
});

test("produtos desativados não são expostos", () => {
  assert.deepEqual(filterProducts([{ ...products[0], active: false }], initialFilters), []);
});

test("catálogo mantém IDs únicos, preços válidos e referências a fotos locais existentes", async () => {
  assert.equal(new Set(products.map((item) => item.id)).size, products.length);
  for (const product of products) {
    assert.equal(product.price === null || (Number.isFinite(product.price) && product.price > 0), true);
    for (const image of product.images) {
      assert.match(image, /^\/products\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|avif)$/i);
      assert.equal(image.split("/").includes(".."), false);
      await access(new URL(`../public${image}`, import.meta.url));
    }
  }
});

test("fonte JSON: exatamente 80 produtos, categorias e campos preservados", async () => {
  const { default: catalog } = await import("../data/catalogo.json", { with: { type: "json" } });
  assert.equal(products.length, 80);
  assert.equal(new Set(products.map(p => p.slug)).size, 80);
  assert.equal(new Set(products.map(p => p.image)).size, 80);
  for (const [category, count] of Object.entries({ bodies: 15, "shorts-bebe": 8, "shorts-infantil": 10, vestidos: 7, "conjuntos-femininos": 30, "conjuntos-masculinos": 10 })) {
    assert.equal(products.filter(p => p.categoryId === category).length, count);
  }
  for (const supplied of catalog.products) {
    const actual = products.find(p => p.id === supplied.id);
    for (const [key, value] of Object.entries(supplied)) assert.deepEqual(actual[key], value);
    assert.deepEqual(actual.images, [supplied.image]);
    assert.deepEqual(actual.sizes, supplied.sizesReference);
  }
  assert.equal(products.filter(p => p.price === null).length, 50);
});