import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../src/lib/packageAccess.js", import.meta.url), "utf8")
  .replace(/^import .*;$/gm, "")
  .replace(/export /g, "");
function setup({ uid = 7, plans = [], courses = [{ id: 42, exam: "General Science" }], fetch, getActivePlans } = {}) {
  const context = vm.createContext({
    FormData,
    AbortSignal,
    fetch,
    process: { env: { PSC_API_KEY: "test", PSC_API_BASE_URL: "https://backend.test" } },
    getStudentSession: async () => ({ uid }),
    getActivePlans: getActivePlans || (async () => plans),
    getPackageDetails: async () => ({ courses }),
  });
  vm.runInContext(source + "\nglobalThis.api = { isCurrentPlan, packageIncludesExam, applyPackageAccess, getOwnedExamIds, getOwnedPackages, invalidatePackageAccess };", context);
  return context.api;
}
const active = { pid: 9, cid: 1, status: 1, expiry_date: "2099-01-01" };

test("only current activated plans qualify", () => {
  const { isCurrentPlan } = setup();
  assert.equal(isCurrentPlan(active), true);
  for (const changes of [
    { status: 0 }, { premium_status: 0 }, { expiry_date: "2000-01-01" },
    { expiry_date: "invalid" }, { starting_date: "2098-01-01" },
  ]) assert.equal(isCurrentPlan({ ...active, ...changes }), false);
});
test("covered tests become free; unrelated tests remain paid", async () => {
  const api = setup({ plans: [active] });
  const result = await api.applyPackageAccess({ data: [
    { course_id: 42, access: "paid" }, { course_id: 99, access: "paid" },
    { subcourse: "GENERAL SCIENCE", access: "paid" },
  ] }, { cid: 1 });
  assert.equal(result.data[0].access, "free");
  assert.equal(result.data[0].packageAccess, true);
  assert.equal(result.data[1].access, "paid");
  assert.equal(result.data[2].access, "free");
});
test("course coverage is inherited by its tests and video chapters", async () => {
  const api = setup({ plans: [active] });
  const result = await api.applyPackageAccess({ data: [{ type: "paid" }, { access: "paid" }] }, { cid: 1, subexamid: 42 });
  assert.equal(result.data[0].type, "free");
  assert.equal(result.data[1].access, "free");
});
test("guest, expired, and other-category plans cannot unlock content", async () => {
  for (const options of [{ uid: 0, plans: [active] }, { plans: [{ ...active, expiry_date: "2000-01-01" }] }, { plans: [{ ...active, cid: 2 }] }]) {
    const result = await setup(options).applyPackageAccess({ course_id: 42, access: "paid" }, { uid: 7, cid: 1 });
    assert.equal(result.access, "paid");
  }
});
test("a category id is not mistaken for an included course", () => {
  const { packageIncludesExam } = setup();
  assert.equal(packageIncludesExam({ courses: [{ id: 42 }] }, { sub_id: 42 }), false);
});


test("legacy test without course metadata is unlocked by verified paginated membership", async () => {
  const offsets = [];
  const api = setup({
    plans: [active],
    fetch: async (_url, { body }) => {
      assert.equal(body.get("subexamid"), "42");
      const offset = body.get("offset");
      offsets.push(offset);
      return { ok: true, json: async () => ({
        status: true,
        items: offset === "0" ? [{ id: 285 }] : [{ id: 287 }],
        nextoffset: offset === "0" ? 20 : null,
      }) };
    },
  });
  const result = await api.applyPackageAccess({ data: [
    { id: 287, subexamid: null, sub_id: "3", subcourse: "10th level exams", access: "paid" },
    { id: 999, subexamid: null, sub_id: "3", subcourse: "10th level exams", access: "paid" },
  ] }, { cid: 1, contentType: "mock" });
  assert.equal(result.data[0].access, "free");
  assert.equal(result.data[1].access, "paid");
  assert.deepEqual(offsets, ["0", "20"]);
  assert.equal((await api.getOwnedExamIds(7, 1, "mock")).has("287"), true);
  assert.equal(offsets.length, 2, "question access reuses the verified list");
});

test("concurrent requests share ownership lookup; payment invalidates it", async () => {
  let calls = 0;
  const api = setup({ getActivePlans: async () => { calls++; return [active]; } });
  await Promise.all(Array.from({ length: 20 }, () => api.getOwnedPackages(7, 1)));
  assert.equal(calls, 1);
  api.invalidatePackageAccess(7, 1);
  await api.getOwnedPackages(7, 1);
  assert.equal(calls, 2);
});

test("membership is isolated by category and exam type", async () => {
  const api = setup({ plans: [active], fetch: async (_url, { body }) => ({
    ok: true, json: async () => ({ status: true, items: [{ id: body.get("type") === "mock" ? 287 : 500 }], nextoffset: null }),
  }) });
  assert.equal((await api.getOwnedExamIds(7, 1, "mock")).has("287"), true);
  assert.equal((await api.getOwnedExamIds(7, 1, "pqp")).has("287"), false);
  assert.equal((await api.getOwnedExamIds(7, 2, "mock")).size, 0);
});

test("an upstream failure never grants membership", async () => {
  const api = setup({ plans: [active], fetch: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(api.getOwnedExamIds(7, 1, "mock"), /429/);
});


function studyPlanBackend(url, { body }) {
  if (url.endsWith("getSubExamDetailsLatest")) {
    assert.equal(body.get("type"), "topic", "studyplan is not a supported course-list type");
    return Promise.resolve({ ok: true, json: async () => ({ status: true, items: [
      { id: 46, subject: "Study Plan" }, { id: 18, subject: "History - India" },
    ] }) });
  }
  assert.ok(url.endsWith("getTopicListNew"));
  assert.equal(body.get("subexamid"), "42");
  return Promise.resolve({ ok: true, json: async () => ({ status: true, data:
    body.get("subid") === "46" ? [{ id: 184, examid: 8 }] : [{ id: 200 }],
  }) });
}

test("Study Plan ownership follows topic exam IDs, not regular mock-test IDs", async () => {
  const api = setup({ plans: [active], fetch: studyPlanBackend });
  const exam = await api.applyPackageAccess({ id: 8, topicid: 184, type: "studyplan", access: "paid" }, { cid: 1, contentType: "studyplan" });
  assert.equal(exam.access, "free");
  assert.equal(exam.packageAccess, true);
  assert.equal(exam.type, "studyplan");
  const unrelated = await api.applyPackageAccess({ id: 999, access: "paid" }, { cid: 1, contentType: "studyplan" });
  assert.equal(unrelated.access, "paid");
});

test("purchased topic unlocks all its videos and preserves notes; unrelated topic stays paid", async () => {
  const api = setup({ plans: [active], fetch: studyPlanBackend });
  const data = [
    { id: 1035, subjectid: 18, type: "paid", notes: "chapter.pdf" },
    { id: 905, subjectid: 46, type: "paid", notes: "notes.pdf" },
  ];
  const covered = await api.applyPackageAccess({ data }, { cid: 1, topicid: 184 });
  assert.ok(covered.data.every((item) => item.type === "free" && item.packageAccess));
  assert.equal(covered.data[0].notes, "chapter.pdf");
  const unrelated = await api.applyPackageAccess({ data }, { cid: 1, topicid: 999 });
  assert.ok(unrelated.data.every((item) => item.type === "paid"));
});

test("a guest cannot unlock Study Plan tests or videos by supplying topic or user IDs", async () => {
  const api = setup({ uid: 0, plans: [active], fetch: () => { throw new Error("Must not query ownership for a guest"); } });
  const exam = await api.applyPackageAccess({ id: 8, access: "paid" }, { uid: 7, cid: 1, contentType: "studyplan" });
  const videos = await api.applyPackageAccess({ data: [{ subjectid: 46, type: "paid" }] }, { uid: 7, cid: 1, topicid: 184 });
  assert.equal(exam.access, "paid");
  assert.equal(videos.data[0].type, "paid");
});
