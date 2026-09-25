import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const forbidden = /^(docs|content|awsTemp|infra|\.git|\.tools|\.local)$|^\.env|\.(tfstate|tfplan)(\..*)?$|\.(pem|key)$/i;

async function assertPublicFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert.equal(forbidden.test(entry.name), false, `Arquivo interno em public: ${entry.name}`);
    assert.equal(entry.isSymbolicLink(), false, `Link simbólico público: ${entry.name}`);
    if (entry.isDirectory()) await assertPublicFiles(path.join(directory, entry.name));
  }
}

test("public contém apenas arquivos destinados à publicação", async () => {
  await assertPublicFiles(fileURLToPath(new URL("../public/", import.meta.url)));
});

test("documentação e planner não são rotas da aplicação", async () => {
  const routes = await readdir(new URL("../src/app/", import.meta.url));
  assert.equal(routes.some((name) => forbidden.test(name)), false);
});
