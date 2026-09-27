import assert from "node:assert/strict";
import test from "node:test";
import catalog from "../data/catalogo.json" with { type: "json" };
import { prepareProducts, importMissing } from "../scripts/seed-products.mjs";
import { createHandler } from "../services/catalog/handler.mjs";
import { effectiveStatus, updateProduct } from "../services/catalog/model.mjs";
import { products } from "../src/data/products.ts";
import { mergeManagedProducts, stockLimit } from "../src/lib/managed-products.ts";
import { parseCart, totalCents } from "../src/lib/cart.ts";

const prepared = prepareProducts(catalog);
const claims = { token_use: "access", "cognito:groups": "[dililu-admin]" };
const editable = p => Object.fromEntries(["name", "reference", "categoryId", "price", "priceOnRequest", "status", "sizes", "version"].map(key => [key, p[key]]));
function fixture() {
  const items = new Map(structuredClone(prepared.items).map(p => [p.productId, p]));
  let writes = 0;
  const handler = createHandler({ list: async () => [...items.values()], get: async id => items.get(id), put: async p => { writes++; items.set(p.productId, p); } });
  const call = async (routeKey, body, auth = claims, id = "dililu-001") => handler({ routeKey, requestContext: { authorizer: { jwt: { claims: auth } } }, pathParameters: { id }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { items, call, writes: () => writes };
}
test("migração preserva 80 produtos, metadados e estoque desconhecido; preços são só proposta", () => {
  assert.equal(prepared.items.length, 80);
  for (const [index, actual] of prepared.items.entries()) {
    const original = catalog.products[index];
    for (const key of ["name", "image", "price", "slug"]) assert.equal(actual[key], original[key]);
    assert.equal(actual.productId, original.id);
    assert(Object.values(actual.sizes).every(q => q === null));
  }
  assert.deepEqual(prepared.report.priceUpdates, { "shorts-infantil": 10, "conjuntos-femininos": 0, "conjuntos-masculinos": 0 });
  assert.equal(prepared.report.ambiguousSets, 40);
  const priced = prepareProducts(catalog, true).items;
  assert.equal(priced.filter((p, i) => p.price !== prepared.items[i].price).length, 10);
});
test("seed idempotente nunca sobrescreve estoque ou preço já editados", async () => {
  const stored = new Map();
  const insert = async p => { if (stored.has(p.productId)) { const error = new Error(); error.name = "ConditionalCheckFailedException"; throw error; } stored.set(p.productId, p); };
  assert.deepEqual(await importMissing(prepared.items, insert), { inserted: 80, existing: 0 });
  stored.set("dililu-001", { edited: true });
  assert.deepEqual(await importMissing(prepared.items, insert), { inserted: 0, existing: 80 });
  assert.deepEqual(stored.get("dililu-001"), { edited: true });
});
test("API nega escrita/listagem admin sem login, token ID ou grupo exato", async () => {
  const f = fixture();
  for (const auth of [null, {}, { ...claims, token_use: "id" }, { ...claims, "cognito:groups": "not-dililu-admin" }]) {
    assert.equal((await f.call("GET /admin/products", undefined, auth)).statusCode, 403);
    assert.equal((await f.call("PUT /admin/products/{id}", {}, auth)).statusCode, 403);
  }
  assert.equal(f.writes(), 0);
  assert.equal((await f.call("DELETE /admin/products/{id}")).statusCode, 404);
});
test("administrador lista 80 produtos e altera preço/estoque com controle de versão", async () => {
  const f = fixture();
  assert.equal(JSON.parse((await f.call("GET /admin/products")).body).products.length, 80);
  const body = { ...editable(prepared.items[0]), price: 42.9, sizes: { M: 2, G: 0 } };
  const result = await f.call("PUT /admin/products/{id}", body);
  assert.equal(result.statusCode, 200);
  assert.equal(JSON.parse(result.body).price, 42.9);
  assert.equal(JSON.parse(result.body).version, 2);
  assert.equal((await f.call("PUT /admin/products/{id}", body)).statusCode, 409);
  assert.equal(f.writes(), 1);
});
test("estoque zero esgota, oculto sai da leitura pública e consulta não vira zero", async () => {
  const f = fixture();
  const body = { ...editable(prepared.items[0]), sizes: { M: 0 }, price: null, priceOnRequest: true };
  const response = JSON.parse((await f.call("PUT /admin/products/{id}", body)).body);
  assert.equal(response.effectiveStatus, "SOLD_OUT");
  assert.equal(response.price, null);
  const hidden = { ...editable(response), status: "HIDDEN" };
  assert.equal((await f.call("PUT /admin/products/{id}", hidden)).statusCode, 200);
  assert.equal((await f.call("GET /products/{id}", undefined, null)).statusCode, 404);
  assert.equal(JSON.parse((await f.call("GET /products", undefined, null)).body).products.length, 79);
  assert.equal(JSON.parse((await f.call("GET /admin/products")).body).products.length, 80);
});
test("edição rejeita adulteração de IDs/fotos, preços, tamanhos e estoque", () => {
  const p = prepared.items[0], body = editable(p);
  for (const mutation of [{ productId: "outro" }, { image: "/novo.png" }, { price: -1 }, { price: 1.001 }, { sizes: { M: -1 } }, { sizes: { M: 1.5 } }, { sizes: { "2": 1 } }, { sizes: {} }, { status: "DELETED" }, { categoryId: "__proto__" }, { name: "" }]) assert.throws(() => updateProduct(p, { ...body, ...mutation }));
  assert.equal(effectiveStatus({ ...p, sizes: { M: null, G: 0 } }), "ACTIVE");
});
test("carrinho exige tamanho e limita estoque compartilhado; preço vem da fonte atual", () => {
  const records = structuredClone(prepared.items);
  records[0].sizes = { M: 2, G: 0 };
  records[0].price = 42.9;
  records[1].status = "HIDDEN";
  const live = mergeManagedProducts(products, records);
  assert.equal(live.length, 79);
  assert.equal(stockLimit(live[0], "G"), 0);
  const item = { productId: "dililu-001", size: "M", print: "A consultar", quantity: 10 };
  assert.deepEqual(parseCart(JSON.stringify([{ ...item, size: "" }]), live), []);
  assert.deepEqual(parseCart(JSON.stringify([{ ...item, size: "G" }]), live), []);
  const cart = parseCart(JSON.stringify([item, item]), live);
  assert.equal(cart[0].quantity, 2);
  assert.equal(totalCents(cart, live), 8580);
  records[0].priceOnRequest = true;
  assert.equal(totalCents(cart, mergeManagedProducts(products, records)), null);
});
