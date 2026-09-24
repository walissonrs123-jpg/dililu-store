import assert from "node:assert/strict";
import test from "node:test";
import { buildPlan, csvCell, toCsv, toMarkdown } from "../scripts/content-plan.mjs";
const template = { story: { caption: "{{name}}: {{price}}", mediaSuggestion: "Foto real", callToAction: "Consultar" } };
const item = { id: "a", date: "2026-09-28", time: "09:00", format: "story", productId: "body-mbaby", title: "Body", status: "planned" };
test("planner usa preço do catálogo e gera os dois formatos", () => {
  const result = buildPlan([item], template);
  assert.ok(result[0].caption.includes("34,90"));
  assert.ok(toCsv(result).includes('"Body M Baby: R$'));
  assert.ok(toMarkdown(result).includes("Agendamento manual"));
});
test("planner rejeita IDs, referências, datas, horários e status inválidos", () => {
  for (const patch of [{ productId: "inexistente" }, { date: "2026-02-30" }, { time: "25:00" }, { status: "invalid" }, { format: "video" }]) assert.throws(() => buildPlan([{ ...item, ...patch }], template));
  assert.throws(() => buildPlan([item, item], template));
});
test("CSV escapa vírgulas/aspas e neutraliza fórmulas", () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell("texto\nlinha"), '"texto\nlinha"');
});
