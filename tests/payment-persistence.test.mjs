import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { localPaymentCommand } from "../src/lib/localPaymentStore.js";

test("payment reservations persist across connections and reject duplicate checkouts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mm-payment-test-"));
  const file = join(dir, "payments.sqlite");
  const command = (...args) => localPaymentCommand(args, file);
  try {
    const reservations = await Promise.all(Array.from({ length: 10 }, () =>
      command("SET", "7:1:9", JSON.stringify({ state: "creating" }), "NX")
    ));
    assert.equal(reservations.filter(r => r === "OK").length, 1);
    assert.equal(JSON.parse(await command("GET", "7:1:9")).state, "creating");
    await command("SET", "7:1:9", JSON.stringify({ state: "captured_pending", paymentId: "pay_test" }));
    assert.equal(JSON.parse(await command("GET", "7:1:9")).paymentId, "pay_test");
    assert.equal(await command("GET", "8:1:9"), null);
    assert.equal(await command("SET", "7:1:9", "{}", "NX"), null);
    await command("DEL", "7:1:9");
    assert.equal(await command("GET", "7:1:9"), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const eligibilitySource = readFileSync(new URL("../src/lib/packagePurchaseEligibility.js", import.meta.url), "utf8")
  .replace(/import\s+[\s\S]*?;\s*/g, "")
  .replace(/export /g, "");

function eligibility(plans, failed = false) {
  const context = vm.createContext({
    console: { error() {} },
    isCurrentPlan: plan => plan.status === 1 && plan.expiry_date > "2026-10-27",
    getActivePlans: async () => { if (failed) throw new Error("offline"); return plans; },
  });
  vm.runInContext(eligibilitySource + "\nglobalThis.check = checkPackagePurchaseEligibility;", context);
  return context.check({ uid: 7, cid: 1, pid: 9 });
}

test("active subscriptions block payment without loading package content", async () => {
  const result = await eligibility([{ pid: 9, cid: 1, status: 1, expiry_date: "2099-01-01" }]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "ALREADY_ACTIVE");
  assert.equal(result.expiryDate, "2099-01-01");
});

test("unrelated and expired subscriptions do not count as owning the selected plan", async () => {
  for (const plan of [
    { pid: 10, cid: 1, status: 1, expiry_date: "2099-01-01" },
    { pid: 9, cid: 2, status: 1, expiry_date: "2099-01-01" },
    { pid: 9, cid: 1, status: 1, expiry_date: "2000-01-01" },
  ]) assert.equal((await eligibility([plan])).allowed, true);
});

test("subscription lookup failures never enable checkout", async () => {
  const result = await eligibility([], true);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "OWNERSHIP_VERIFICATION_FAILED");
});
