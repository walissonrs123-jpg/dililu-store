import assert from "node:assert/strict";
import test from "node:test";
import { contentSecurityPolicy } from "../src/lib/csp.ts";

test("CSP de produção bloqueia eval, handlers, plugins e conexões externas", () => {
  const policy = contentSecurityPolicy();
  assert.ok(!policy.includes("unsafe-eval"));
  assert.ok(!policy.includes("*"));
  for (const directive of ["script-src-attr 'none'", "object-src 'none'", "connect-src 'self'", "base-uri 'none'", "form-action 'none'"]) assert.ok(policy.split("; ").includes(directive));
});
test("exceções de desenvolvimento não entram na política de produção", () => {
  assert.ok(contentSecurityPolicy(true).includes("unsafe-eval"));
  assert.ok(contentSecurityPolicy(true).includes("ws://localhost:*"));
  assert.ok(!contentSecurityPolicy(false).includes("ws:"));
});
