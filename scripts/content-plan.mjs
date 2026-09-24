import { products } from "../src/data/products.ts";
import { formatPrice } from "../src/lib/catalog.ts";

export const fields = ["id", "date", "time", "format", "productId", "title", "caption", "mediaSuggestion", "callToAction", "status", "notes"];
const formats = ["feed", "story", "reel"];
const statuses = ["planned", "ready", "scheduled", "published", "skipped"];

/** @returns {import('../content/model.ts').ContentPlanItem[]} */
export function buildPlan(input, templates) {
  if (!Array.isArray(input)) throw new Error("Calendário deve ser uma lista.");
  const seen = new Set();
  return input.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Item inválido.");
    for (const field of fields) if (item[field] !== undefined && typeof item[field] !== "string") throw new Error(`Campo ${field} deve ser texto.`);
    if (!item.id?.trim() || seen.has(item.id)) throw new Error("ID ausente ou duplicado.");
    seen.add(item.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date ?? "") || !Number.isFinite(Date.parse(`${item.date}T12:00:00Z`)) || new Date(`${item.date}T12:00:00Z`).toISOString().slice(0, 10) !== item.date) throw new Error(`Data inválida: ${item.id}`);
    if (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) throw new Error(`Horário inválido: ${item.id}`);
    if (!formats.includes(item.format) || !statuses.includes(item.status)) throw new Error(`Formato/status inválido: ${item.id}`);
    const product = products.find((product) => product.active && product.id === item.productId);
    if (item.productId && !product) throw new Error(`productId desconhecido: ${item.id}`);
    const template = templates[item.format];
    const variables = product ? { name: product.name, description: product.shortDescription, price: formatPrice(product.price) } : {};
    const result = {};
    for (const field of fields) {
      const value = item[field] ?? (["caption", "mediaSuggestion", "callToAction"].includes(field) && product ? template?.[field] : "") ?? "";
      result[field] = value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
        if (!(name in variables)) throw new Error(`Variável desconhecida: ${name}`);
        return variables[name];
      });
    }
    for (const field of ["title", "caption", "mediaSuggestion"]) if (!result[field].trim()) throw new Error(`Campo obrigatório: ${field} (${item.id})`);
    return result;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function csvCell(value) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@-]|^[\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function toCsv(items) {
  return "\uFEFF" + [fields.join(","), ...items.map((item) => fields.map((field) => csvCell(item[field])).join(","))].join("\r\n") + "\r\n";
}
function markdown(value) { return String(value ?? "").replace(/[\\`*_{}[\]<>#|]/g, "\\$&"); }
export function toMarkdown(items) {
  return "# Plano Instagram — Dililu\n\nHorários: America/Sao_Paulo. Agendamento manual no Meta Business Suite. Revisar texto e mídia antes de publicar.\n\n" + items.map((item) => `## ${markdown(item.date)} ${markdown(item.time)} — ${markdown(item.title)}\n\nFormato: ${item.format} · Status: ${item.status} · Produto: ${markdown(item.productId || "—")}\n\n${markdown(item.caption)}\n\n**Mídia:** ${markdown(item.mediaSuggestion)}\n\n**CTA:** ${markdown(item.callToAction)}\n\n**Notas:** ${markdown(item.notes)}\n`).join("\n");
}
