import assert from "node:assert/strict";
import test from "node:test";
import { parseCart, totalCents, whatsappMessage } from "../src/lib/cart.ts";

const body = { productId: "body-mbaby", size: "M", print: "A consultar", quantity: 2 };
test("carrinho tolera corrupção, produtos removidos e variações inválidas", () => {
  for (const raw of ["{", "null", "{}", JSON.stringify([{ ...body, size: "XXXL" }]), JSON.stringify([{ ...body, quantity: -1 }]), JSON.stringify([{ ...body, productId: "inexistente" }])]) assert.deepEqual(parseCart(raw), []);
});
test("restauração combina duplicatas, limita quantidade e ignora preço adulterado", () => {
  const result = parseCart(JSON.stringify([body, { ...body, quantity: 200, price: 0.01 }]));
  assert.equal(result[0].quantity, 99);
  assert.equal(totalCents(result), 3490 * 99);
  assert.equal("price" in result[0], false);
});
test("mensagem contém variações, quantidades, preços e confirmação de entrega", () => {
  const items = parseCart(JSON.stringify([body, { productId: "short-mbaby", size: "P", print: "A consultar", quantity: 1 }]));
  assert.equal(totalCents(items), 8970);
  const message = whatsappMessage(items);
  for (const part of ["2 × Body M Baby", "Tamanho: M", "Estampa: A consultar", "34,90", "69,80", "89,70", "disponibilidade", "entrega ou retirada"]) assert.ok(message.includes(part), part);
  assert.equal(decodeURIComponent(encodeURIComponent(message)), message);
});
