import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPlan, toCsv, toMarkdown } from "./content-plan.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const calendarRoot = await realpath(path.join(root, "content/calendar"));
const input = await realpath(path.resolve(root, process.argv[2] ?? "content/calendar/week-01.json"));
if (!input.startsWith(calendarRoot + path.sep) || path.extname(input) !== ".json") throw new Error("Use um JSON dentro de content/calendar.");
const templates = JSON.parse(await readFile(path.join(root, "content/templates/default.json"), "utf8"));
const items = buildPlan(JSON.parse(await readFile(input, "utf8")), templates);
const destination = path.join(root, "content/exports");
await mkdir(destination, { recursive: true });
const name = path.basename(input, ".json");
await Promise.all([writeFile(path.join(destination, `${name}.md`), toMarkdown(items)), writeFile(path.join(destination, `${name}.csv`), toCsv(items))]);
console.log(`${items.length} itens exportados em content/exports/${name}.{md,csv}. Nenhum agendamento executado.`);
