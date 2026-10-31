import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const babel = require("next/dist/compiled/babel/core");
const base = "../src/app/(student)/dashboard/[governmentExamsSlug]/scert-tests/start/components/";
const load = async path => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const data = await load("../src/lib/examAttemptData.js");


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
    if (id === "@/lib/examAttemptData") return data;
    if (id.endsWith(".jsx") || !id.includes("hooks")) return id.split("/").at(-1);
    throw new Error(`Unexpected import ${id}`);
  } });
  return exports.default;
}

function find(tree, type) {
  if (!tree || typeof tree !== "object") return null;
  if (tree.type === type) return tree;
  return (tree.children || []).flat(Infinity).map(child => find(child, type)).find(Boolean);
}

async function setup({ uid = 21, paused = null, guestAction = "", failSave = false } = {}) {
  const h = hooks(), requests = [], paths = [], checkpoints = [], intervals = [], timers = [];
  let now = 1800000000000;
  const props = { examId: 40, uid, cid: 1, classId: 3, governmentExamsSlug: "kerala-psc", durationMinutes: 1, guestAction, exam: { exam_name: "SCERT Test" }, questions: [{ id: 1, answer: "A" }, { id: 2, answer: "B" }] };
  const guest = { examId: "40", examType: "scert", cid: 1, classId: 3, action: guestAction, answers: { 1: "A" }, questionIds: ["1", "2"], remainingSeconds: 45, startTime: now, currentPage: 1 };
  const router = { push: p => paths.push(p), replace: p => paths.push(p) };
  const deps = { react: h.react, "react": h.react, "next/navigation": { useRouter: () => router }, "@/lib/guestExamHandoff": {
    readGuestExamHandoff: () => guest,
    clearGuestExamHandoff() {},
    saveGuestExamHandoff: v => checkpoints.push(v),
    guestExamLoginRedirectPath: action => `/dashboard/kerala-psc/scert-tests/start?examId=40&classId=3&guestAction=${action}`,
  } };
  const run = await moduleFor("ScertExamClient.jsx", deps, {
    Date: class extends Date { static now() { return now; } },
    window: { setTimeout: (fn, delay) => { timers.push({ fn, delay }); return 1; }, clearTimeout() {}, setInterval: fn => { intervals.push(fn); return 1; }, clearInterval() {}, scrollTo() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async (endpoint, options) => {
      const body = options.body ? JSON.parse(options.body) : null;
      requests.push({ endpoint, body });
      if (body && failSave) return { ok: false, status: 502, json: async () => ({ status: false, message: "Save failed" }) };
      return { ok: true, json: async () => body ? { status: true, pauseid: 329, savedResult: { ...body, total_correct: 1, total_wrong: 0, total_attempted: 1, user_score: 1 } } : { status: true, paused } };
    },
  });
  const render = () => { h.reset(); return run(props); };
  const settle = async () => { render(); await h.flush(); return render(); };
  await settle(); await settle();
  return { render, settle, requests, paths, checkpoints, timers, expire: async () => { now += 61000; intervals.at(-1)?.(); return settle(); } };
}

for (const action of ["pause", "submit"]) {
  test(`SCERT guest ${action} asks for login before saving`, async () => {
    const h = await setup({ uid: 0 });
    find(h.render(), "ScertQuestionList").props.onAnswer(1, "A");
    find(h.render(), "ScertExamActions").props[action === "pause" ? "onPause" : "onFinish"]();
    const modal = find(h.render(), "LoginRequiredModal");
    assert.equal(modal.props.open, true);
    assert.equal(h.requests.length, 0);
    await modal.props.onLogin();
    assert.equal(h.checkpoints[0].action, action);
    assert.equal(h.checkpoints[0].answers[1], "A");
    assert.match(h.paths[0], /^\/login\?redirect=/);
  });
}

test("SCERT guest timeout returns to public class cards without login or submission", async () => {
  const h = await setup({ uid: 0 });
  await h.expire();
  assert.equal(find(h.render(), "ExamTimeFinishedModal").props.open, true);
  h.timers.find(t => t.delay === 5000).fn();
  assert.equal(h.paths[0], "/government-exams-coaching/kerala-psc/scert-tests/classes/3");
  assert.equal(h.requests.length, 0);
});

test("SCERT pause at zero answers waits for confirmation then creates and exits", async () => {
  const h = await setup();
  find(h.render(), "ScertExamActions").props.onPause();
  assert.equal(h.requests.filter(r => r.body).length, 0);
  const modal = find(h.render(), "ExamPauseConfirmationModal");
  assert.equal(modal.props.open, true);
  await modal.props.onConfirm();
  assert.equal(h.requests.at(-1).body.action, "create");
  assert.equal(h.requests.at(-1).body.exam_status, "pause");
  assert.equal(h.paths[0], "/dashboard/kerala-psc/scert-tests/classes/3");
});

test("SCERT post-login pause asks for confirmation and Continue unlocks answers", async () => {
  const h = await setup({ guestAction: "pause" });
  const modal = find(h.render(), "ExamPauseConfirmationModal");
  assert.equal(modal.props.open, true);
  assert.equal(h.requests.length, 0);
  modal.props.onContinue();
  assert.equal(find(h.render(), "ScertQuestionList").props.disabled, false);
  await h.settle();
  await h.expire();
  assert.equal(h.requests.at(-1).body.exam_status, "finish");
});

test("SCERT post-login finish saves restored answers and opens results", async () => {
  const h = await setup({ guestAction: "submit" });
  assert.equal(h.requests.at(-1).body.user_answers[0], "A");
  assert.equal(find(h.render(), "ExamResultModal").props.open, true);
});

test("SCERT resume fetches answers and uses update with the saved ID", async () => {
  const h = await setup({ paused: { id: 329, user_answers: ["B", 0], paused_time: 45000, exam_status: "pause" } });
  assert.match(h.requests[0].endpoint, /scert-attempt\?/);
  assert.equal(find(h.render(), "ScertQuestionList").props.getSelectedAnswer({ id: 1 }), "B");
  assert.equal(find(h.render(), "ScertExamHeader").props.remainingSeconds, 45);
  await find(h.render(), "ScertExamActions").props.onFinish();
  assert.equal(h.requests.at(-1).body.action, "update");
  assert.equal(h.requests.at(-1).body.pauseid, 329);
});

test("SCERT signed-in timeout auto-submits; result Close and Analysis open analysis", async () => {
  const h = await setup();
  await h.expire();
  assert.equal(h.requests.at(-1).body.exam_status, "finish");
  const modal = find(h.render(), "ExamResultModal");
  assert.equal(modal.props.open, true);
  modal.props.onClose(); modal.props.onViewAnalysis();
  for (const path of h.paths) assert.match(path, /exam-analysis\?attemptId=329&examType=scert/);
});

test("SCERT failed pause stays in confirmation with a visible retry error", async () => {
  const h = await setup({ failSave: true });
  find(h.render(), "ScertExamActions").props.onPause();
  await find(h.render(), "ExamPauseConfirmationModal").props.onConfirm();
  const modal = find(h.render(), "ExamPauseConfirmationModal");
  assert.equal(modal.props.open, true);
  assert.equal(modal.props.error, "Save failed");
  assert.equal(h.paths.length, 0);
});


async function routeModule(uid = 21) {
  const source = await readFile(new URL("../src/app/api/scert-attempt/route.js", import.meta.url), "utf8");
  const { code } = babel.transformSync(source, { babelrc: false, configFile: false, plugins: [require("next/dist/compiled/babel/plugin-transform-modules-commonjs")] });
  const selector = await load("../src/lib/mockPausedAttempt.js");
  const requests = [], exports = {};
  const deps = {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
    "@/lib/auth/getStudentSession": { getStudentSession: async () => ({ uid }) },
    "@/lib/examAttemptData": data,
    "@/lib/mockPausedAttempt": selector,
    "@/lib/examAttemptHelper": { getUserExamAttempts: async args => { requests.push(args); return { data: [{ id: 329, exam_id: 40, uid: 21, cid: 1, exam_type: "scert", exam_status: "pause" }] }; } },
  };
  vm.runInNewContext(code, { exports, console, URL, FormData, AbortSignal, process: { env: { PSC_API_BASE_URL: "https://psc.example.test", PSC_API_KEY: "test-key" } }, require: id => deps[id], fetch: async (endpoint, options) => { requests.push({ endpoint, form: Object.fromEntries(options.body) }); return { ok: true, json: async () => ({ status: true, pauseid: 329 }) }; } });
  return { exports, requests };
}

test("SCERT paused lookup uses session identity and the scert exam type", async () => {
  const h = await routeModule();
  const result = await h.exports.GET({ url: "https://app.test/api/scert-attempt?uid=999&cid=1&exam_id=40" });
  assert.equal(result.status, 200);
  assert.equal(result.body.paused.id, 329);
  assert.equal(h.requests[0].uid, 21);
  assert.equal(h.requests[0].examType, "scert");
});

for (const action of ["create", "update"]) {
  test(`SCERT ${action} uses the requested upstream API and converts time once`, async () => {
    const h = await routeModule();
    const result = await h.exports.POST({ json: async () => ({ uid: 999, cid: 1, exam_id: 40, exam_type: "scert", action, pauseid: action === "update" ? 329 : undefined, exam_status: "pause", remaining_seconds: 20, start_time: Date.now(), answer_array: ["A", "B"], user_answers: ["A", 0] }) });
    assert.equal(result.status, 200);
    assert.equal(h.requests[0].endpoint, `https://psc.example.test/${action === "create" ? "setNewUserExams" : "setUpdateUserExams"}`);
    assert.equal(h.requests[0].form.uid, "21");
    assert.equal(h.requests[0].form.paused_time, "20000");
    assert.equal(h.requests[0].form.exam_type, "scert");
  });
}
