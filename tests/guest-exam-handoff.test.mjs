import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/lib/guestExamHandoff.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const {
  clearGuestExamHandoff,
  readGuestExamHandoff,
  saveGuestExamHandoff,
  guestExamLoginRedirectPath,
} = await import(moduleUrl);

function installStorage() {
  const values = new Map();
  globalThis.window = {
    location: { origin: "https://example.test", pathname: "/government-exams-coaching/kerala-psc/topic-wise-exams/731/start", search: "" },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };
  return values;
}

test("guest exam handoff restores answers and action only for the selected exam", () => {
  installStorage();
  const attempt = {
    examId: 731,
    examType: "twe",
    governmentExamsSlug: "kerala-psc",
    action: "pause",
    answers: { 11: "B", 12: "D" },
    currentPage: 2,
    remainingSeconds: 418,
    startTime: 1791512820000,
    endTime: 1791513240000,
  };

  saveGuestExamHandoff(attempt);

  const restored = readGuestExamHandoff({
    examId: "731",
    examType: "TWE",
    governmentExamsSlug: "kerala-psc",
  });
  assert.equal(restored.action, "pause");
  assert.deepEqual(restored.answers, attempt.answers);
  assert.equal(restored.currentPage, 2);
  assert.equal(restored.remainingSeconds, 418);
  assert.equal(restored.startTime, attempt.startTime);
  assert.equal(restored.endTime, attempt.endTime);
  assert.equal(
    readGuestExamHandoff({
      examId: "732",
      examType: "twe",
      governmentExamsSlug: "kerala-psc",
    }),
    null
  );
});

test("clearing guest handoff removes the saved attempt", () => {
  const values = installStorage();
  saveGuestExamHandoff({
    examId: 10,
    examType: "pqp",
    governmentExamsSlug: "kerala-psc",
    action: "submit",
    answers: {},
  });

  clearGuestExamHandoff();

  assert.equal(values.size, 0);
});

for (const action of ["pause", "submit"]) {
  test(`mock guest ${action} preserves answers and exact login destination`, () => {
    installStorage();
    const returnPath = "/government-exams-coaching/kerala-psc/mock-tests/40/start";
    saveGuestExamHandoff({ examId: 40, examType: "mock", governmentExamsSlug: "kerala-psc", action, answers: { 1: "A" }, remainingSeconds: 45, returnPath });
    const destination = new URL(guestExamLoginRedirectPath(action), window.location.origin);
    assert.equal(destination.pathname, returnPath);
    assert.equal(destination.searchParams.get("guestAction"), action);
    assert.deepEqual(readGuestExamHandoff({ examId: 40, examType: "mock", governmentExamsSlug: "kerala-psc" }).answers, { 1: "A" });
  });
}
