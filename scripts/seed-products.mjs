import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export function prepareProducts(catalog, approvedPrices = false) {
  const categoryIds = { body: "bodies", "short-bebe": "shorts-bebe", "short-infantil": "shorts-infantil", vestido: "vestidos" };
  const prices = { "shorts-infantil": 19.9, "conjuntos-femininos": 59.9, "conjuntos-masculinos": 49.9 };
  const priceUpdates = { "shorts-infantil": 0, "conjuntos-femininos": 0, "conjuntos-masculinos": 0 };
  let ambiguousSets = 0;
  const items = catalog.products.map(product => {
    const categoryId = product.category === "conjunto" ? product.gender === "feminino" ? "conjuntos-femininos" : product.gender === "masculino" ? "conjuntos-masculinos" : "" : categoryIds[product.category];
    if (!categoryId || !/^dililu-\d{3}$/.test(product.id)) throw new Error(`Classificação/ID inválido: ${product.id}`);
    const jennynha = /\bJennynha\b/i.test(`${product.brand ?? ""} ${product.name}`);
    const candidate = product.price === null && (categoryId === "shorts-infantil" || (product.category === "conjunto" && jennynha));
    if (candidate) priceUpdates[categoryId]++;
    if (product.price === null && product.category === "conjunto" && !jennynha) ambiguousSets++;
    const price = approvedPrices && candidate ? prices[categoryId] : product.price;
    return { productId: product.id, reference: product.id, name: product.name, slug: product.slug, categoryId, sourceCategory: product.category, audience: product.audience, gender: product.gender, image: product.image, order: product.order,
      price, priceOnRequest: price === null, status: product.active ? "ACTIVE" : "HIDDEN", sizes: Object.fromEntries(product.sizesReference.map(size => [size, null])), version: 1 };
  });
  if (new Set(items.map(item => item.productId)).size !== items.length) throw new Error("IDs duplicados.");
  return { items, report: { found: catalog.products.length, prepared: items.length, ignored: 0, priceUpdates, ambiguousSets, pricesApplied: approvedPrices } };
}
export async function importMissing(items, insert) {
  let inserted = 0, existing = 0;
  for (const item of items) {
    try { await insert(item); inserted++; }
    catch (error) { if (error.name === "ConditionalCheckFailedException") existing++; else throw error; }
  }
  return { inserted, existing };
}
function attribute(value) {
  if (value === null) return { NULL: true };
  if (typeof value === "string") return { S: value };
  if (typeof value === "number") return { N: String(value) };
  if (typeof value === "boolean") return { BOOL: value };
  return { M: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, attribute(entry)])) };
}
async function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some(arg => !["--execute", "--approved-prices"].includes(arg))) throw new Error("Argumento desconhecido.");
  const catalog = JSON.parse(await readFile(new URL("../data/catalogo.json", import.meta.url), "utf8"));
  const { items, report } = prepareProducts(catalog, args.has("--approved-prices"));
  console.log(JSON.stringify(report, null, 2));
  if (!args.has("--execute")) { console.log("DRY RUN: nenhuma chamada AWS ou escrita no catálogo."); return; }
  if (process.env.DILILU_SEED_AUTHORIZED !== "320169806724/DililuProducts") throw new Error("Execução exige autorização explícita DILILU_SEED_AUTHORIZED.");
  const aws = process.env.AWS_CLI ?? "aws";
  const identity = spawnSync(aws, ["sts", "get-caller-identity", "--output", "json"], { encoding: "utf8" });
  if (identity.status !== 0 || JSON.parse(identity.stdout).Account !== "320169806724") throw new Error("Conta AWS inesperada ou acesso indisponível.");
  const directory = await mkdtemp(join(tmpdir(), "dililu-seed-"));
  try {
    const result = await importMissing(items, async item => {
      const path = join(directory, "item.json");
      await writeFile(path, JSON.stringify({ TableName: "DililuProducts", Item: attribute(item).M, ConditionExpression: "attribute_not_exists(productId)" }));
      const response = spawnSync(aws, ["dynamodb", "put-item", "--region", "us-east-1", "--cli-input-json", `file://${path}`], { encoding: "utf8", env: { ...process.env, AWS_CLI_FILE_ENCODING: "UTF-8" } });
      if (response.status !== 0) {
        const error = new Error(`Importação interrompida: ${item.productId}`);
        if (response.stderr?.includes("ConditionalCheckFailedException")) error.name = "ConditionalCheckFailedException";
        throw error;
      }
    });
    console.log(JSON.stringify(result));
  } finally { await rm(directory, { recursive: true, force: true }); }
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
