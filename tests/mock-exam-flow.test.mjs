import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../src/", import.meta.url);
const base = "app/(student)/dashboard/[governmentExamsSlug]/mock-tests/[examId]/start/";
const url = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const read = (path) => readFile(new URL(path, root), "utf8");
const utilsUrl = url(await read(base + "utils/mockTestUtils.js"));
const payloadUrl = url((await read(base + "utils/mockAttemptUtils.js")).replace('"./mockTestUtils"', JSON.stringify(utilsUrl)));
const reactUrl = url(`
export const useCallback = (fn) => fn;
export const useEffect = () => {};
export const useRef = (value) => { const h = globalThis.mockHooks; const i = h.index++; return h.slots[i] ??= {current:value}; };
export const useState = (value) => { const h = globalThis.mockHooks; const i = h.index++; if (!(i in h.slots)) h.slots[i] = value; return [h.slots[i], v => h.slots[i] = v]; };
`);
const navigationUrl = url(`export const useRouter = () => globalThis.mockHooks.router;`);
const handoffUrl = url(`export const clearGuestExamHandoff = () => {};`);
const hookSource = (await read(base + "hooks/useMockExamAttempt.js"))
  .replace('"react"', JSON.stringify(reactUrl))
  .replace('"next/navigation"', JSON.stringify(navigationUrl))
  .replace('"../utils/mockTestUtils"', JSON.stringify(utilsUrl))
  .replace('"../utils/mockAttemptUtils"', JSON.stringify(payloadUrl))
  .replace('"@/lib/guestExamHandoff"', JSON.stringify(handoffUrl));
const { default: runAttemptHook } = await import(url(hookSource));
const { selectMockPausedAttempt } = await import(url(await read("lib/mockPausedAttempt.js")));

function setup(overrides = {}, fail = false) {
  const requests = [], paths = [];
  globalThis.mockHooks = { slots: [], index: 0, router: { push: p => paths.push(p), replace: p => paths.push(p) } };
  globalThis.localStorage = { setItem() {}, removeItem() {} };
  globalThis.fetch = async (endpoint, options) => {
    requests.push({ endpoint, body: JSON.parse(options.body) });
    if (fail) return new Response(JSON.stringify({ status: false, message: "Save failed" }), { status: 502 });
    return new Response(JSON.stringify({ status: true, pauseid: 329, data: { exam_status: "finish" } }));
  };
  const props = { uid: 21, cid: 1, examId: 40, governmentExamsSlug: "kerala-psc", exam: { total_mark: 2 }, questions: [{ id: 1, answer: "A" }, { id: 2, answer: "B" }], answersRef: { current: {} }, remainingSeconds: 60, currentPage: 1, startTime: Date.now(), ...overrides };
  const render = () => { globalThis.mockHooks.index = 0; return runAttemptHook(props); };
  return { render, requests, paths };
}

test("pause saves even zero answers and exits to exam cards", async () => {
  const h = setup();
  assert.equal(await h.render().handlePause(), true);
  assert.equal(h.requests[0].endpoint, "/api/exam-attempt/create");
  assert.equal(h.requests[0].body.exam_status, "pause");
  assert.deepEqual(h.requests[0].body.user_answers, [0, 0]);
  assert.equal(h.paths[0], "/dashboard/kerala-psc/mock-tests");
});

test("resumed attempts update the existing pause ID", async () => {
  const h = setup({ initialPauseId: 329 });
  await h.render().handlePause();
  assert.equal(h.requests[0].endpoint, "/api/exam-attempt/update");
  assert.equal(h.requests[0].body.pauseid, "329");
});

for (const timeout of [false, true]) {
  test(`${timeout ? "timeout" : "manual finish"} opens results; close goes to analysis`, async () => {
    const h = setup({ remainingSeconds: timeout ? 0 : 60 });
    assert.equal(await h.render().finishExam({ timeout }), true);
    const state = h.render();
    assert.equal(state.resultModalOpen, true);
    assert.equal(state.submitted, true);
    state.handleResultClose();
    assert.match(h.paths[0], /exam-analysis\?attemptId=329/);
    assert.equal(h.requests[0].body.exam_status, "finish");
  });
}

test("duplicate finish clicks save once", async () => {
  const h = setup();
  const state = h.render();
  await Promise.all([state.handleSubmit(), state.handleSubmit()]);
  assert.equal(h.requests.filter(r => r.endpoint.endsWith("/create")).length, 1);
});

test("failed timeout stays retryable without opening results or navigating", async () => {
  const h = setup({ remainingSeconds: 0 }, true);
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.equal(await h.render().finishExam({ timeout: true }), false);
  } finally { console.error = originalError; }
  assert.equal(h.render().timeoutStatus, "error");
  assert.equal(h.render().resultModalOpen, false);
  assert.deepEqual(h.paths, []);
});

test("getUserExams restores only latest matching paused attempt", () => {
  const query = { uid: 21, cid: 1, examId: 40 };
  const paused = { id: 329, exam_id: 40, uid: 21, cid: 1, exam_type: "mock", exam_status: "pause", user_answers: ["A", 0] };
  assert.deepEqual(selectMockPausedAttempt({ data: [paused] }, query), paused);
  assert.equal(selectMockPausedAttempt({ data: [paused, { ...paused, id: 330, exam_status: "finish" }] }, query), null);
  assert.equal(selectMockPausedAttempt({ data: [{ ...paused, uid: 22 }] }, query), null);
  assert.equal(selectMockPausedAttempt({ data: [] }, query), null);
});

test("mock payload sends remaining seconds for one server conversion", async () => {
  const { buildMockAttemptPayload } = await import(payloadUrl);
  for (const seconds of [0, 30, 120, 3600]) {
    assert.equal(buildMockAttemptPayload({ remainingSeconds: seconds }).paused_time, String(seconds));
  }
});


test("paused lookup posts session identity and exam filters to getUserExams", async () => {
  process.env.PSC_API_BASE_URL = "https://psc.example.test/public/api";
  process.env.PSC_API_KEY = "test-key";
  const dataUrl = url(await read("lib/examAttemptData.js"));
  const helperSource = (await read("lib/examAttemptHelper.js")).replace('"./examAttemptData"', JSON.stringify(dataUrl));
  const { getUserExamAttempts } = await import(url(helperSource));
  let request;
  globalThis.fetch = async (endpoint, options) => {
    request = { endpoint, options };
    return new Response(JSON.stringify({ status: true, data: [] }));
  };
  await getUserExamAttempts({ uid: 21, cid: 1, examId: 40 });
  assert.equal(request.endpoint, "https://psc.example.test/public/api/getUserExams");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(Object.fromEntries(request.options.body), { api: "test-key", uid: "21", cid: "1", exam_id: "40", exam_type: "mock" });
});
