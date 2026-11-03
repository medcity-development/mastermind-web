import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const state = { session: { uid: 9 }, paused: { id: 31, exam_id: 40, uid: 9, cid: 1, exam_type: "mock", exam_status: "pause" }, verified: true };
const catalog = {
  getTopicWiseExams: async () => ({ data: [{ id: 5, subject: "General Knowledge" }] }),
  getAllTopicWiseTests: async () => ({ data: [{ id: 40, exam_name: "Practice One" }] }),
  getStatementTypeTopics: async () => ({ data: [{ id: 5, subject: "Statements" }] }),
  getStatementTypeExamsByTopic: async () => ({ data: [{ id: 40, exam_name: "Practice One" }] }),
  getScertFolders: async ({ offset }) => ({ data: [{ id: offset === 0 ? 6 : 7 }], nextOffset: offset === 0 ? 1 : null }),
  getScertTestsByClassId: async ({ classId }) => ({ data: classId === 7 ? [{ id: 40 }] : [] }),
  createSlug: (value) => value.toLowerCase().replaceAll(" ", "-"),
};
const mocks = globalThis.__pausedResumeMocks = {
  "@/lib/topicWiseExamHelper": catalog,
  "@/lib/statementTypeExamHelper": catalog,
  "@/lib/scertHelper": catalog,
  "@/lib/pscSlug": catalog,
  "next/server": { NextResponse: { json: (body, options) => Response.json(body, options) } },
  "@/lib/auth/getStudentSession": { getStudentSession: async () => state.session },
  "@/lib/governmentExamConfig": { getGovernmentExamConfig: (slug) => slug === "kerala-psc" ? { slug, cid: 1 } : null },
  "@/lib/examHistoryApi": { normalizeHistoryType: (type) => type, backendHistoryType: (type) => type === "topicwise" ? "twe" : type, isHistoryTypeEnabled: (type) => ["mock", "pqp", "scert", "topicwise", "tst", "studyplan"].includes(type) },
  "@/lib/examAttemptHelper": { getUserExamAttempts: async () => ({ data: [state.paused] }) },
  "@/lib/examHistoryHelper": { verifyExamHistoryCourse: async () => state.verified },
};
async function load(path) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  source = source.replace('import "server-only";', "").replace(/import \{([^}]+)\} from "([^"]+)";/g, (_, names, path) => `const {${names}} = globalThis.__pausedResumeMocks[${JSON.stringify(path)}];`);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}
const { selectMockPausedAttempt } = await load("../src/lib/mockPausedAttempt.js");
mocks["@/lib/mockPausedAttempt"] = { selectMockPausedAttempt };
const resolver = await load("../src/lib/pausedExamResume.js");
mocks["@/lib/pausedExamResume"] = resolver;
const { POST } = await load("../src/app/api/exam-attempt/resume/route.js");
const options = { uid: 9, cid: 1, governmentExamsSlug: "kerala-psc", examId: 40, pauseId: 31 };

for (const [examType, path] of Object.entries({ mock: "mock-tests/40/start", pqp: "previous-questions/40/start", studyplan: "studyplan-tests/40/start", topicwise: "topic-wise-exams/test/general-knowledge/40/start", tst: "statement-type-exams/statements/practice-one/start", scert: "scert-tests/start" })) {
  test(`resolves ${examType} to its existing resume player`, async () => {
    const href = await resolver.resolvePausedExamHref({ ...options, examType });
    const url = new URL(href, "http://localhost");
    assert.equal(url.pathname, `/dashboard/kerala-psc/${path}`);
    assert.equal(url.searchParams.get("pauseId"), "31");
    assert.equal(url.searchParams.get("mode"), "resume");
    if (examType === "scert") {
      assert.equal(url.searchParams.get("classId"), "7");
      assert.equal(url.searchParams.get("examId"), "40");
    }
  });
}
function request(overrides = {}) {
  return new Request("http://localhost/api/exam-attempt/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...options, examType: "mock", ...overrides }) });
}
test("resume requires authentication", async () => {
  state.session = null;
  assert.equal((await POST(request())).status, 401);
  state.session = { uid: 9 };
});
test("resume rejects invalid and stale attempt IDs", async () => {
  assert.equal((await POST(request({ pauseId: -1 }))).status, 400);
  assert.equal((await POST(request({ pauseId: 32 }))).status, 409);
});
test("completed or another user's attempts cannot resume", async () => {
  const original = state.paused;
  state.paused = { ...original, exam_status: "finish" };
  assert.equal((await POST(request())).status, 409);
  state.paused = { ...original, uid: 10 };
  assert.equal((await POST(request())).status, 409);
  state.paused = original;
});
test("course verification is required before returning a resume link", async () => {
  state.verified = false;
  assert.equal((await POST(request())).status, 403);
  state.verified = true;
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).href, "/dashboard/kerala-psc/mock-tests/40/start?mode=resume&pauseId=31");
});
