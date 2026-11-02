import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const load = async (path) =>
  import(
    `data:text/javascript;base64,${Buffer.from(
      await readFile(new URL(path, import.meta.url), "utf8")
    ).toString("base64")}`
  );

const { buildAttemptPayload, withPausedAttemptPlaceholders } =
  await load("../src/lib/examAttemptData.js");
const { calculateExamScore } =
  await load("../src/lib/examResultUtils.js");
const { selectMockPausedAttempt } =
  await load("../src/lib/mockPausedAttempt.js");
const { getPausedAttemptIds } =
  await load("../src/lib/pausedExamAttempts.js");

test("Statement Type pause saves progress without publishing scores", () => {
  const payload = buildAttemptPayload(
    {
      cid: 1,
      exam_id: 40,
      exam_type: "tst",
      exam_status: "pause",
      total_questions: 4,
      total_mark: 4,
      answer_array: ["A", "B", "E", "D"],
      user_answers: ["A", "E", 0, 0],
      paused_time: 125000,
    },
    21
  );
  const saved = withPausedAttemptPlaceholders(payload);

  assert.equal(saved.exam_status, "pause");
  assert.deepEqual(saved.user_answers, ["A", "E", 0, 0]);
  assert.equal(saved.paused_time, 125000);
  assert.equal(saved.user_score, "");
  assert.equal(saved.minus_mark, "");
  assert.equal(saved.total_correct, "");
  assert.equal(saved.total_wrong, "");
});

test("Statement Type finish applies Android scoring with four- and five-option answers", () => {
  const payload = buildAttemptPayload(
    {
      cid: 1,
      exam_id: 40,
      exam_type: "tst",
      exam_status: "finish",
      total_questions: 4,
      total_mark: 4,
      answer_array: ["A", "B", "E", "D"],
      user_answers: ["A", "E", 0, "D"],
    },
    21
  );

  assert.equal(payload.total_attempted, 3);
  assert.equal(payload.total_correct, 2);
  assert.equal(payload.total_wrong, 1);
  assert.equal(payload.minus_mark, 0.33);
  assert.equal(payload.user_score, 1.67);

  const displayed = calculateExamScore(payload);
  assert.equal(displayed.correct, 2);
  assert.equal(displayed.wrong, 1);
  assert.equal(displayed.minusMark, 0.33);
  assert.equal(displayed.score, 1.67);
});

test("Statement Type resumes only the latest matching paused getUserExams attempt", () => {
  const paused = {
    id: 330,
    uid: 21,
    cid: 1,
    exam_id: 40,
    exam_type: "tst",
    status: "pause",
    user_answers: ["A", "E", 0],
  };
  const result = {
    details: [
      { ...paused, id: 329, status: "finish" },
      paused,
      { ...paused, id: 331, exam_id: 41 },
    ],
  };

  assert.deepEqual(
    selectMockPausedAttempt(result, {
      uid: 21,
      cid: 1,
      examId: 40,
      examType: "tst",
    }),
    paused
  );

  assert.equal(
    selectMockPausedAttempt(
      {
        data: [
          paused,
          { ...paused, id: 331, status: "finish" },
        ],
      },
      {
        uid: 21,
        cid: 1,
        examId: 40,
        examType: "tst",
      }
    ),
    null
  );
});

test("Statement Type cards resume only the latest paused getUserExamsList attempt", () => {
  const result = {
    details: [
      {
        id: 330,
        exam_id: 40,
        exam_type: "tst",
        exam_status: "pause",
      },
      {
        id: 331,
        exam_id: 41,
        exam_type: "tst",
        exam_status: "finish",
      },
    ],
  };

  assert.deepEqual(getPausedAttemptIds(result), {
    40: "330",
  });
});
