import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL(
    "../src/app/(student)/dashboard/[governmentExamsSlug]/exam-attempted/utils/examHistoryUtils.js",
    import.meta.url
  ),
  "utf8"
);

const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {
  buildExamHistoryTabs,
  formatExamDate,
  getAttemptEndTime,
  getAttemptEndTimestamp,
  getAttemptExamType,
  getAttemptStartTime,
  getAttemptStartTimestamp,
  sortAttemptsNewestFirst,
} = await import(moduleUrl);

test("shows all supported exam types with zero counts when history is empty", () => {
  assert.deepEqual(
    buildExamHistoryTabs([]).map(({ key, count }) => [key, count]),
    [
      ["all", 0],
      ["mock", 0],
      ["pqp", 0],
      ["scert", 0],
      ["topicwise", 0],
      ["studyplan", 0],
    ]
  );
});

test("counts attempts by supported type and normalizes type aliases", () => {
  const attempts = [
    { exam_type: "mock" },
    { exam_type: "mock" },
    { exam_type: "pqp" },
    { exam_type: "pyq" },
    { exam_type: "scert" },
    { exam_type: "topic-wise" },
    { exam_type: "study_plan" },
  ];

  assert.deepEqual(
    buildExamHistoryTabs(attempts).map(({ key, count }) => [key, count]),
    [
      ["all", 7],
      ["mock", 2],
      ["pqp", 2],
      ["scert", 1],
      ["topicwise", 1],
      ["studyplan", 1],
    ]
  );
});

test("formats UTC exam history timestamps in India time", () => {
  assert.equal(
    formatExamDate("2026-10-09T04:27:00Z"),
    "09 Oct 2026, 09:57 AM"
  );
});

test("formats epoch-millisecond history timestamps in India time", () => {
  assert.equal(
    formatExamDate(Date.UTC(2026, 9, 9, 4, 27)),
    "09 Oct 2026, 09:57 AM"
  );
});

test("interprets timezone-less exam history timestamps as India time", () => {
  assert.equal(
    formatExamDate("2026-10-09 04:27:00"),
    "09 Oct 2026, 04:27 AM"
  );
});

test("formats midnight and noon with the correct AM/PM marker", () => {
  assert.equal(
    formatExamDate("2026-10-10 00:21:00"),
    "10 Oct 2026, 12:21 AM"
  );
  assert.equal(
    formatExamDate("2026-10-10 12:21:00"),
    "10 Oct 2026, 12:21 PM"
  );
});

test("uses saved start and end timestamp fields for attempt history", () => {
  assert.equal(
    getAttemptStartTime({
      start_time: Date.UTC(2026, 9, 10, 5, 39),
      created_at: "2026-10-09T22:39:00Z",
    }),
    "10 Oct 2026, 11:09 AM"
  );
  assert.equal(
    getAttemptEndTime({
      end_time: Date.UTC(2026, 9, 10, 5, 41),
      modified_at: "2026-10-09T22:41:00Z",
    }),
    "10 Oct 2026, 11:11 AM"
  );
});

test("uses legacy creation and modification times when explicit attempt times are absent", () => {
  assert.equal(
    getAttemptStartTime({ created_at: "2026-10-09T04:27:00Z" }),
    "09 Oct 2026, 09:57 AM"
  );
  assert.equal(
    getAttemptEndTime({
      modified_at: "2026-10-09T05:27:00Z",
      updated_at: "2026-10-09T05:30:00Z",
    }),
    "09 Oct 2026, 10:57 AM"
  );
  assert.equal(
    getAttemptStartTimestamp({ created_at: "2026-10-09 04:27:00" }).source,
    "record-created"
  );
  assert.equal(
    getAttemptEndTimestamp({ modified_at: "2026-10-09 05:27:00" }).source,
    "record-updated"
  );
});

test("does not invent a start time from the maximum exam duration", () => {
  const attempt = {
    exam_status: "finish",
    modified_at: "2026-10-10 13:22:00",
    _examDurationSeconds: 30 * 60,
  };

  assert.equal(
    getAttemptStartTime(attempt),
    "\u2014"
  );
  assert.equal(
    getAttemptStartTimestamp(attempt).source,
    "missing"
  );
});

test("sorts attempt history by completion time before its older creation time", () => {
  const olderCompletedAttempt = {
    id: "older-completed",
    created_at: "2026-10-10T10:00:00+05:30",
    end_time: "2026-10-10T10:30:00+05:30",
  };
  const newlyCompletedResumedAttempt = {
    id: "newly-completed",
    created_at: "2026-10-09T22:39:00+05:30",
    end_time: "2026-10-10T11:10:00+05:30",
  };

  assert.deepEqual(
    sortAttemptsNewestFirst([
      olderCompletedAttempt,
      newlyCompletedResumedAttempt,
    ]).map(({ id }) => id),
    ["newly-completed", "older-completed"]
  );
});

test("normalizes the backend topic-wise type alias for history tabs", () => {
  assert.equal(getAttemptExamType({ exam_type: "twe" }), "topicwise");
});

test("includes supported Study Plan history with canonical type names", async () => {
  const source = await readFile(
    new URL("../src/lib/examHistoryTypes.js", import.meta.url),
    "utf8"
  );
  const historyTypesUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const { getExamHistoryTypes } = await import(historyTypesUrl);

  assert.deepEqual(getExamHistoryTypes(), ["mock", "pqp", "scert", "topicwise", "tst", "studyplan"]);
});

test("remaining countdown time cannot fabricate an exam completion time", () => {
  assert.equal(getAttemptEndTimestamp({ start_time: '2026-10-29 10:00:00', paused_time: 45000 }).source, 'missing');
});
