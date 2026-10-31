import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../src/lib/initiatePackagePayment.js", import.meta.url), "utf8")
  .replace('import "server-only";', "").replace("export async function", "async function");
const input = { uid: 21, pid: 3, priceId: 47, amountPaise: 9900, packageAmountPaise: 14900, durationDays: 30, duration: "1 MONTH", promocode: "SAVE50", deduction: 50, now: new Date("2026-10-27T20:00:00Z") };
function setup({ backend = {}, order = {}, fail = false } = {}) {
  const calls = [];
  const context = vm.createContext({ FormData, AbortSignal, Buffer, process: { env: {
    PSC_API_BASE_URL: "https://backend.test/api", PSC_API_KEY: "test-api",
    RAZORPAY_KEY_ID: "rzp_test_example", RAZORPAY_KEY_SECRET: "test-secret",
  } }, fetch: async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return { ok: !fail, json: async () => ({ status: true, orderid: "order_example", razorpayId: "rzp_test_example", amount: "99", ...backend }) };
    return { ok: true, json: async () => ({ id: "order_example", currency: "INR", amount: 9900, amount_paid: 0, status: "created", ...order }) };
  } });
  vm.runInContext(source + "\nglobalThis.initiate = initiatePackagePayment", context);
  return { calls, run: () => context.initiate(input) };
}

test("PSC initiation receives server-verified plan fields and its order is reused", async () => {
  const { calls, run } = setup();
  const result = await run();
  assert.equal(calls[0].url, "https://backend.test/api/initiateRazorpayPaymentLatest");
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(Object.fromEntries(calls[0].options.body), {
    api: "test-api", uid: "21", pid: "3", amount: "99.00", pack_amount: "149.00",
    pack_priceid: "47", pack_expiry: "2026-11-27", pack_duration: "1 MONTH",
    promocode: "SAVE50", deduction: "50.00",
  });
  assert.equal(calls[1].url, "https://api.razorpay.com/v1/orders/order_example");
  assert.equal(calls[1].options.method, "GET", "does not create a second Razorpay order");
  assert.equal(result.order.id, "order_example");
});

test("invalid backend results cannot reach checkout", async () => {
  for (const options of [
    { fail: true }, { backend: { status: false } },
    { backend: { amount: "1" } }, { backend: { razorpayId: "different-account" } },
    { order: { amount: 100 } }, { order: { status: "paid" } },
    { order: { currency: "USD" } },
  ]) await assert.rejects(setup(options).run);
});

test("checkout binds the backend order and plan to the authenticated user before returning it", async () => {
  const route = readFileSync(new URL("../src/app/api/payments/razorpay/order/route.js", import.meta.url), "utf8")
    .replace(/import\s+[\s\S]*?;\s*/g, "").replace(/export /g, "");
  const events = [];
  let saved;
  const context = vm.createContext({
    console, process: { env: { RAZORPAY_KEY_ID: "test", RAZORPAY_KEY_SECRET: "secret" } },
    NextResponse: { json: (body, options) => ({ body, ...options }) },
    getStudentSession: async () => ({ uid: 21, stage: "completed" }),
    checkPackagePurchaseEligibility: async () => ({ allowed: true }),
    getSelectedPackagePrice: async () => ({ packageDetails: { title: "Test" }, selectedPrice: { validity: "1 MONTH" }, durationDays: 30 }),
    calculatePackageTotal: () => ({ total: 99 }),
    reservePayment: async () => { events.push("reserve"); return {}; },
    initiatePackagePayment: async args => {
      events.push("initiate");
      assert.equal(args.uid, 21);
      assert.equal(args.priceId, 47);
      return { order: { id: "order_example" }, expiryDate: "2026-11-27" };
    },
    savePaymentRecord: async (uid, cid, pid, record) => { events.push("save"); saved = record; },
  });
  vm.runInContext(route + "\nglobalThis.post = POST", context);
  const response = await context.post({ json: async () => ({ uid: 999, cid: 1, pid: 3, priceId: 47, amount: 1 }) });
  assert.equal(response.status, 200);
  assert.deepEqual(events, ["reserve", "initiate", "save"]);
  assert.equal(saved.source, "psc");
  assert.equal(saved.uid, 21);
  assert.equal(saved.durationDays, 30);
  assert.equal(saved.priceId, "47");
  assert.equal(saved.expiryDate, "2026-11-27");
  assert.equal(response.body.order.id, saved.orderId);
  assert.equal(response.body.order.amount, 9900);
});
