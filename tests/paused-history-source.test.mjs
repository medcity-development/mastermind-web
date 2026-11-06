import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadServerModule } from "./helpers/load-server-module.mjs";

const source = (await readFile(new URL("../src/lib/pausedExamHistory.js", import.meta.url), "utf8"))
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export async function", "async function");
const { selectStudentAttempts } = await loadServerModule("studentAttemptHistory");
const { getPausedAttempts } = await loadServerModule("pausedExamAttempts");
const { selectMockPausedAttempt } = await loadServerModule("mockPausedAttempt");
const makeLoader = new Function("getUserExamsList", "getUserExamAttempts", "backendHistoryType",
  "selectStudentAttempts", "getPausedAttempts", "selectMockPausedAttempt", "verifyExamHistoryCourse",
  `${source}\nreturn getPausedExamHistory;`);

test("paused history uses fresh getUserExams progress and drops completed attempts", async () => {
  const row = { id: 10, uid: 9, cid: 2, exam_id: 174, exam_type: "mock", exam_status: "pause" };
  const calls = [];
  let status = "pause";
  const load = makeLoader(
    async () => ({ status: true, details: [row] }),
    async (params) => { calls.push(params); return { status: true, details: [
      { ...row, id: 11, exam_status: status, paused_time: "592000", user_answers: '["C",0]' },
    ] }; },
    (type) => type, selectStudentAttempts, getPausedAttempts, selectMockPausedAttempt,
    async () => true,
  );
  const result = await load({ uid: 9, cid: 2, examType: "mock" });
  assert.deepEqual(calls[0], { uid: 9, cid: 2, examId: 174, examType: "mock" });
  assert.equal(result.details[0]._historyId, 11);
  assert.equal(result.details[0].paused_time, "592000");
  assert.equal(result.details[0].user_answers, '["C",0]');
  status = "finish";
  assert.equal((await load({ uid: 9, cid: 2, examType: "mock" })).details.length, 0);
});

test("unverified course and failed saved-progress requests are not shown as resumable", async () => {
  const row = { id: 10, uid: 9, exam_id: 174, exam_type: "mock", exam_status: "pause" };
  let saved = { status: true, details: [row] };
  const load = makeLoader(async () => ({ status: true, details: [row] }),
    async () => saved, (type) => type, selectStudentAttempts, getPausedAttempts,
    selectMockPausedAttempt, async () => null);
  const result = await load({ uid: 9, cid: 2, examType: "mock" });
  assert.equal(result.partialVerification, true);
  assert.equal(result.details.length, 0);
  saved = { status: false, message: "Unavailable" };
  assert.equal((await load({ uid: 9, cid: 2, examType: "mock" })).partialVerification, true);
});
