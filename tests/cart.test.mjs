import assert from "node:assert/strict";
import test from "node:test";
import { parseCart, totalCents, whatsappMessage } from "../src/lib/cart.ts";

const body = { productId: "dililu-001", size: "M", print: "A consultar", quantity: 2 };
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
  const items = parseCart(JSON.stringify([body, { productId: "dililu-016", size: "P", print: "A consultar", quantity: 1 }]));
  assert.equal(totalCents(items), 8970);
  const message = whatsappMessage(items);
  for (const part of ["2 × Body MBaby Feminino Coelho Azul", "Tamanho de referência desejado: M", "Estampa: A consultar", "34,90", "69,80", "89,70", "Consulte tamanhos disponíveis", "Entrega ou retirada"]) assert.ok(message.includes(part), part);
  assert.equal(decodeURIComponent(encodeURIComponent(message)), message);
});

test("preço sob consulta nunca vira zero ou subtotal completo enganoso", () => {
  const unknown = { productId: "dililu-024", size: "2", print: "A consultar", quantity: 1 };
  assert.equal(totalCents([unknown]), null);
  assert.equal(totalCents([body, unknown]), null);
  const text = whatsappMessage([body, unknown]);
  assert.ok(text.includes("Subtotal dos produtos: Consulte o valor"));
  assert.ok(text.includes("Preço unitário: Consulte o valor"));
  assert.equal(text.includes("R$ 0,00"), false);
});

test("carrinho antigo não é associado arbitrariamente a uma nova estampa", () => {
  assert.deepEqual(parseCart(JSON.stringify([{ ...body, productId: "body-mbaby" }])), []);
});