import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadServerModule } from "./helpers/load-server-module.mjs";

const sourceRoot = new URL("../src/", import.meta.url);
const readSource = (path) =>
  readFile(new URL(path, sourceRoot), "utf8");
const moduleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

const mockUtilsUrl = moduleUrl(
  await readSource(
    "app/(student)/dashboard/[governmentExamsSlug]/mock-tests/[examId]/start/utils/mockTestUtils.js"
  )
);
const attemptDataUrl = moduleUrl(
  await readSource("lib/examAttemptData.js")
);
const pausedAttemptUrl = moduleUrl(
  await readSource("lib/mockPausedAttempt.js")
);
const attemptData = await import(attemptDataUrl);
const resultUtils = await import(
  moduleUrl(await readSource("lib/examResultUtils.js"))
);
const examUtilsSource = (await readSource(
  "app/(student)/dashboard/[governmentExamsSlug]/studyplan-tests/components/utils/examUtils.js"
))
  .replace(
    '"@/app/(student)/dashboard/[governmentExamsSlug]/mock-tests/[examId]/start/utils/mockTestUtils"',
    JSON.stringify(mockUtilsUrl)
  )
  .replace('"@/lib/examAttemptData"', JSON.stringify(attemptDataUrl))
  .replace('"@/lib/mockPausedAttempt"', JSON.stringify(pausedAttemptUrl));
const examUtils = await import(moduleUrl(examUtilsSource));
const { prepareExamHistoryResult } = await loadServerModule("examHistoryResult");

test("Study Plan saves pause and finish with the expected API fields", () => {
  const questions = [
    { id: 1, answer: "A", option1: "One", option2: "Two", option3: "Three", option4: "Four" },
    { id: 2, answer: "E", option1: "One", option2: "Two", option3: "Three", option4: "Four", option5: "Five" },
  ];
  const answers = { 1: "B", 2: "E" };
  const common = {
    cid: 1,
    examId: 40,
    exam: { total_mark: 2, total_minutes: 20 },
    questions,
    answers,
    remainingSeconds: 120,
    startTime: 1791512820000,
  };

  const pause = examUtils.buildStudyPlanAttemptPayload({
    ...common,
    examStatus: "pause",
  });
  assert.equal(pause.exam_type, "studyplan");
  assert.equal(pause.exam_status, "pause");
  assert.equal(pause.remaining_seconds, 120);
  assert.deepEqual(pause.answer_array, ["A", "E"]);
  assert.deepEqual(pause.user_answers, ["B", "E"]);

  const finish = examUtils.buildStudyPlanAttemptPayload({
    ...common,
    examStatus: "finish",
  });
  assert.equal(finish.exam_type, "studyplan");
  assert.equal(finish.exam_status, "finish");
  assert.deepEqual(finish.user_answers, ["B", "E"]);

  const result = examUtils.buildStudyPlanResult({
    exam: common.exam,
    questions,
    answers,
    attemptId: 329,
  });
  assert.equal(result.id, 329);
  assert.equal(result.total_correct, 1);
  assert.equal(result.total_wrong, 1);
  assert.equal(result.user_score, 0.67);
  assert.equal(result.minus_mark, 0.33);

  const apiPayload = attemptData.buildAttemptPayload(
    {
      ...finish,
      exam_type: "studyplan",
    },
    21
  );
  assert.equal(apiPayload.exam_status, "finish");
  assert.equal(apiPayload.exam_type, "studyplan");
  assert.equal(apiPayload.user_score, 0.67);
  assert.equal(apiPayload.minus_mark, 0.33);
  assert.equal(apiPayload.total_correct, 1);
  assert.equal(apiPayload.total_wrong, 1);

  const displayedResult = resultUtils.calculateExamScore({
    ...result,
    exam_type: "studyplan",
  });
  assert.equal(displayedResult.score, 0.67);
  assert.equal(displayedResult.minusMark, 0.33);
  assert.equal(displayedResult.correct, 1);
  assert.equal(displayedResult.wrong, 1);
  assert.equal(
    examUtils.buildStudyPlanResult({
      exam: { total_mark: 5, total_minutes: 20 },
      questions: [
        { id: 1, answer: "A", option1: "One", option2: "Two", option3: "Three", option4: "Four" },
        { id: 2, answer: "A", option1: "One", option2: "Two", option3: "Three", option4: "Four" },
        { id: 3, answer: "A", option1: "One", option2: "Two", option3: "Three", option4: "Four" },
        { id: 4, answer: "A", option1: "One", option2: "Two", option3: "Three", option4: "Four" },
      ],
      answers: { 1: "B", 2: "B", 3: "B", 4: "A" },
      attemptId: 330,
    }).user_score,
    0
  );
});

test("Study Plan instructions include each backend instruction in order", () => {
  const exam = {
    id: 40,
    exam_name: "Exam - Day-01",
    total_questions: 20,
  };
  assert.deepEqual(
    examUtils.extractStudyPlanExam(
      {
        exam: [exam],
        data: [{ instructions: "Read this instruction" }],
      },
      40
    ),
    exam
  );
  assert.equal(
    examUtils.extractStudyPlanExam(
      { exam: [{ ...exam, id: 41 }] },
      40
    ),
    null
  );

  assert.deepEqual(
    examUtils.extractStudyPlanInstructions({
      data: [
        { instructions: "First instruction" },
        { instructions: "Second instruction" },
      ],
      instructions: ["Third instruction"],
    }),
    [
      "First instruction",
      "Second instruction",
      "Third instruction",
    ]
  );
});

test("Study Plan history hides paused scores and recalculates finished scores using Android marks", () => {
  const paused = prepareExamHistoryResult({
    exam_type: "studyplan",
    exam_status: "pause",
    user_score: 1.67,
    minus_mark: 0.33,
    total_mark: 20,
    total_attempted: 3,
    total_correct: 2,
    total_wrong: 1,
  });
  assert.equal(paused.user_score, null);
  assert.equal(paused.minus_mark, null);
  assert.equal(paused.total_attempted, null);
  assert.equal(paused.total_correct, null);
  assert.equal(paused.total_wrong, null);

  const finished = prepareExamHistoryResult({
    exam_type: "studyplan",
    exam_status: "finish",
    user_score: 99,
    minus_mark: 0,
    total_mark: 20,
    total_attempted: 3,
    total_correct: 2,
    total_wrong: 1,
  });
  assert.equal(finished.user_score, 1.67);
  assert.equal(finished.minus_mark, 0.33);
});

test("Study Plan restores A-E answer letters and rejects non-paused attempts", () => {
  const questions = [
    { id: 10, answer: "A", option1: "One", option2: "Two" },
    { id: 11, answer: "E", option1: "One", option2: "Two", option3: "Three", option4: "Four", option5: "Five" },
  ];

  assert.deepEqual(
    examUtils.restoreStudyPlanAnswers(questions, '["B","E"]'),
    { 10: "B", 11: "E" }
  );

  const paused = {
    id: 901,
    exam_id: 40,
    uid: 21,
    cid: 1,
    exam_type: "studyplan",
    exam_status: "pause",
  };
  assert.deepEqual(
    examUtils.selectStudyPlanPausedAttempt(
      { details: [paused] },
      { examId: 40, uid: 21, cid: 1 }
    ),
    paused
  );
  assert.equal(
    examUtils.selectStudyPlanPausedAttempt(
      { details: [{ ...paused, exam_status: "finish" }] },
      { examId: 40, uid: 21, cid: 1 }
    ),
    null
  );
});

test("Study Plan uses getUserExams, setNewUserExams, and setUpdateUserExams", async (context) => {
  const previousBase = process.env.PSC_API_BASE_URL;
  const previousKey = process.env.PSC_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.PSC_API_BASE_URL = "https://studyplan-api.example.test";
  process.env.PSC_API_KEY = "test-key";

  context.after(() => {
    if (previousBase === undefined) delete process.env.PSC_API_BASE_URL;
    else process.env.PSC_API_BASE_URL = previousBase;
    if (previousKey === undefined) delete process.env.PSC_API_KEY;
    else process.env.PSC_API_KEY = previousKey;
    globalThis.fetch = previousFetch;
  });

  const helperSource = (await readSource("lib/examAttemptHelper.js"))
    .replace('"./examAttemptData"', JSON.stringify(attemptDataUrl));
  const helper = await import(moduleUrl(helperSource));
  const requests = [];

  globalThis.fetch = async (endpoint, options) => {
    requests.push({
      endpoint,
      fields: Object.fromEntries(options.body.entries()),
    });
    return new Response(JSON.stringify({
      status: true,
      pauseid: 329,
      details: [],
    }));
  };

  await helper.getUserExamAttempts({
    uid: 21,
    cid: 1,
    examId: 40,
    examType: "studyplan",
  });
  await helper.createUserExamAttempt({
    cid: 1,
    uid: 21,
    exam_id: 40,
    exam_type: "studyplan",
    exam_status: "pause",
    total_questions: 2,
    total_mark: 2,
    paused_time: 120000,
    answer_array: ["A", "E"],
    user_answers: ["B", "E"],
  });
  await helper.updateUserExamAttempt({
    cid: 1,
    uid: 21,
    exam_id: 40,
    exam_type: "studyplan",
    exam_status: "finish",
    pauseid: 329,
    total_questions: 2,
    total_mark: 2,
    answer_array: ["A", "E"],
    user_answers: ["B", "E"],
    user_score: 0.67,
    minus_mark: 0.33,
  });

  assert.deepEqual(
    requests.map((request) => request.endpoint),
    [
      "https://studyplan-api.example.test/getUserExams",
      "https://studyplan-api.example.test/setNewUserExams",
      "https://studyplan-api.example.test/setUpdateUserExams",
    ]
  );
  assert.equal(requests[0].fields.exam_type, "studyplan");
  assert.equal(requests[0].fields.exam_id, "40");
  assert.equal(requests[1].fields.exam_status, "pause");
  assert.equal(requests[1].fields.exam_type, "studyplan");
  assert.equal(requests[1].fields.user_score, "0");
  assert.equal(requests[1].fields.minus_mark, "0");
  assert.equal(requests[1].fields.user_answers, '["B","E"]');
  assert.equal(requests[2].fields.pauseid, "329");
  assert.equal(requests[2].fields.exam_status, "finish");
  assert.equal(requests[2].fields.user_score, "0.67");
});
