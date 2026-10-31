import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const babel = require("next/dist/compiled/babel/core");
const base = "../src/app/(student)/dashboard/[governmentExamsSlug]/previous-questions/[examId]/components/";
const load = async path => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const data = await load("../src/lib/examAttemptData.js");
const utils = await load(base + "utils/examUtils.js");

function hooks() {
  const slots = [], effects = [];
  let index = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState(value) {
      const i = index++;
      if (!slots[i]) { slots[i] = { value: typeof value === "function" ? value() : value }; slots[i].set = v => slots[i].value = typeof v === "function" ? v(slots[i].value) : v; }
      return [slots[i].value, slots[i].set];
    },
    useRef(value) { const i = index++; return slots[i] ??= { current: value }; },
    useMemo(fn, deps) { const i = index++; if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { value: fn(), deps }; return slots[i].value; },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) { const i = index++; if (!slots[i] || !same(slots[i].deps, deps)) { slots[i] = { deps }; effects.push(fn); } },
  };
  return { react, reset() { index = 0; }, async flush() { for (const effect of effects.splice(0)) effect(); await new Promise(resolve => setImmediate(resolve)); } };
}

async function moduleFor(file, deps, globals = {}) {
  const source = await readFile(new URL(base + file, import.meta.url), "utf8");
  const { code } = babel.transformSync(source, { filename: file, babelrc: false, configFile: false, presets: [require("next/dist/compiled/babel/preset-react")], plugins: [require("next/dist/compiled/babel/plugin-transform-modules-commonjs")] });
  const exports = {};
  vm.runInNewContext(code, { exports, React: deps.react, console, Date, URLSearchParams, ...globals, require: id => {
    if (deps[id]) return deps[id];
    if (id.endsWith("examUtils")) return utils;
    if (id === "@/lib/examAttemptData") return data;
    if (id.endsWith(".jsx") || !id.includes("hooks")) return id.split("/").at(-1);
    throw new Error(`Unexpected import ${id}`);
  } });
  return exports.default;
}

async function controller(overrides = {}, paused = null) {
  const h = hooks(), requests = [], paths = [], checkpoints = [];
  const props = { examId: 40, uid: 21, cid: 1, governmentExamsSlug: "kerala-psc", exam: { total_minutes: 10 }, questions: [{ id: 1, answer: "A" }, { id: 2, answer: "B" }], ...overrides };
  const router = { push: p => paths.push(p) };
  const deps = { react: h.react, "react": h.react, "next/navigation": { useRouter: () => router }, "@/lib/guestExamHandoff": { saveGuestExamHandoff: v => checkpoints.push(v), guestExamLoginRedirectPath: action => `/dashboard/kerala-psc/previous-questions/40/start?guestAction=${action}` } };
  const run = await moduleFor("hooks/useExamController.js", deps, {
    window: { setInterval: () => 1, clearInterval() {}, scrollTo() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async (endpoint, options) => {
      requests.push({ endpoint, body: options.body ? JSON.parse(options.body) : null });
      return { ok: true, json: async () => options.method === "POST" ? { status: true, pauseid: 329 } : { status: true, paused } };
    },
  });
  const render = () => { h.reset(); return run(props); };
  render(); await h.flush();
  return { render, requests, paths, checkpoints };
}

test("PYQ first pause saves zero answers through create", async () => {
  const h = await controller();
  assert.ok(await h.render().handlePause());
  const saved = h.requests.at(-1).body;
  assert.equal(saved.action, "create");
  assert.equal(saved.exam_type, "pqp");
  assert.equal(saved.exam_status, "pause");
  assert.deepEqual(saved.user_answers, [0, 0]);
});

test("PYQ resume loads server answers and time, then updates the same attempt", async () => {
  const h = await controller({}, { id: 329, exam_status: "pause", user_answers: ["A", 0], paused_time: 120000 });
  assert.match(h.requests[0].endpoint, /pyq-attempt\?/);
  assert.equal(h.render().answers[1], "A");
  assert.equal(h.render().remainingSeconds, 120);
  await h.render().handlePause();
  assert.equal(h.requests.at(-1).body.action, "update");
  assert.equal(h.requests.at(-1).body.pauseid, 329);
});

test("PYQ guest pause preserves answers and redirects only when requested", async () => {
  const h = await controller({ uid: 0 });
  assert.equal(h.requests.length, 0);
  h.render().handleAnswer(1, "A");
  await h.render().handlePause();
  assert.equal(h.checkpoints[0].answers[1], "A");
  assert.equal(h.checkpoints[0].action, "pause");
  assert.match(h.paths[0], /^\/login\?redirect=/);
  assert.equal(h.requests.length, 0);
});

test("PYQ timeout submit opens results and duplicate clicks save once", async () => {
  const h = await controller({}, { id: 329, exam_status: "pause", user_answers: ["A", 0], paused_time: 0 });
  const state = h.render();
  assert.equal(state.timerFinished, true);
  await Promise.all([state.handleSubmit(), state.handleSubmit()]);
  assert.equal(h.requests.filter(r => r.body).length, 1);
  assert.equal(h.requests.at(-1).body.exam_status, "finish");
  assert.equal(h.render().resultModalOpen, true);
});

function find(tree, type) {
  if (!tree || typeof tree !== "object") return null;
  if (tree.type === type) return tree;
  return (tree.children || []).flat(Infinity).map(child => find(child, type)).find(Boolean);
}

async function client(uid, changes = {}, guestAction = "") {
  const h = hooks(), paths = [], timers = [], calls = [];
  const c = { restoreReady: true, totalQuestions: 2, timerFinished: false, remainingSeconds: 60, interactionFrozen: false, submittedResult: { id: 329 }, handlePause: async () => { calls.push("pause"); return true; }, handleSubmit: async () => calls.push("submit"), freezeInteraction: () => calls.push("freeze"), continueRestoredExam: () => calls.push("continue"), restoreGuestAttempt: () => calls.push("restore"), ...changes };
  const router = { push: p => paths.push(p), replace: p => paths.push(p) };
  const deps = { react: h.react, "react": h.react, "next/navigation": { useRouter: () => router }, "./hooks/useExamController": () => c, "@/lib/guestExamHandoff": { clearGuestExamHandoff() {}, readGuestExamHandoff: () => ({ action: guestAction }) } };
  const run = await moduleFor("ExamClient.jsx", deps, { window: { setTimeout: (fn, delay) => { timers.push({ fn, delay }); return 1; }, clearTimeout() {} } });
  const render = () => { h.reset(); return run({ uid, examId: 40, governmentExamsSlug: "kerala-psc", guestAction, exam: {} }); };
  return { render, flush: h.flush, calls, paths, timers };
}

test("guest Pause opens login before saving", async () => {
  const h = await client(0);
  find(h.render(), "ExamPause").props.onPause();
  const modal = find(h.render(), "LoginRequiredModal");
  assert.equal(modal.props.open, true);
  assert.deepEqual(h.calls, ["freeze"]);
  await modal.props.onLogin();
  assert.deepEqual(h.calls, ["freeze", "pause"]);
});

test("signed-in pause waits for confirmation then returns to PYQ cards", async () => {
  const h = await client(21);
  find(h.render(), "ExamPause").props.onPause();
  assert.deepEqual(h.calls, []);
  const modal = find(h.render(), "ExamPauseConfirmationModal");
  assert.equal(modal.props.open, true);
  await modal.props.onConfirm();
  assert.equal(h.paths[0], "/dashboard/kerala-psc/previous-questions");
});

test("guest timeout shows modal and returns to public cards without submitting", async () => {
  const h = await client(0, { timerFinished: true });
  assert.equal(find(h.render(), "ExamTimeFinishedModal").props.open, true);
  await h.flush();
  h.timers.find(t => t.delay === 5000).fn();
  assert.equal(h.paths[0], "/government-exams-coaching/kerala-psc/previous-questions");
  assert.deepEqual(h.calls, []);
});

test("both result actions open the saved PYQ analysis", async () => {
  const h = await client(21, { submitted: true, resultModalOpen: true });
  const modal = find(h.render(), "ExamResultModal");
  modal.props.onClose();
  modal.props.onViewAnalysis();
  assert.equal(h.paths.length, 2);
  for (const path of h.paths) assert.match(path, /exam-analysis\?attemptId=329&examType=pqp/);
});


for (const action of ["pause", "submit"]) {
  test(`post-login ${action} restores progress before continuing`, async () => {
    const h = await client(21, { interactionFrozen: true }, action);
    h.render(); await h.flush();
    h.timers.find(t => t.delay === 0).fn();
    const tree = h.render(); await h.flush();
    if (action === "pause") {
      assert.deepEqual(h.calls, ["restore"]);
      const modal = find(tree, "ExamPauseConfirmationModal");
      assert.equal(modal.props.open, true);
      await modal.props.onConfirm();
      assert.deepEqual(h.calls, ["restore", "pause"]);
    } else {
      assert.deepEqual(h.calls, ["restore", "submit"]);
    }
  });
}

test("signed-in timeout automatically submits an active exam", async () => {
  const h = await client(21, { timerFinished: true, interactionFrozen: false });
  h.render(); await h.flush();
  assert.deepEqual(h.calls, ["submit"]);
});
