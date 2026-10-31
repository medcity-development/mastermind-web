import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

let source = await readFile(
  new URL("../src/lib/auth/postLoginRedirect.js", import.meta.url),
  "utf8"
);

source = source.replace(
  'import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";',
  `const getGovernmentExamConfig = (slug) =>
    ["kerala-psc", "rrb-ssc"].includes(slug) ? { slug } : null;`
);

const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { getPostLoginRedirectPath } = await import(moduleUrl);

test("returns the dashboard listing for the selected mock test", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/kerala-psc/mock-tests/123?selectedTestTitle=Degree+Mock"
    ),
    "/dashboard/kerala-psc/mock-tests?selectedTestId=123&selectedTestTitle=Degree+Mock"
  );
});

test("resolves an SEO-friendly mock-test URL to its selected dashboard test ID", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/rrb-ssc/mock-tests/indian-polity-and-constitution?examId=172&selectedTestTitle=Indian+Polity"
    ),
    "/dashboard/rrb-ssc/mock-tests?selectedTestId=172&selectedTestTitle=Indian+Polity"
  );
});

test("returns the selected SCERT class and test", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/kerala-psc/scert-tests/tests/class-8-maths?classId=8&examId=456&selectedTestTitle=Class+8+Maths"
    ),
    "/dashboard/kerala-psc/scert-tests/classes/8?selectedTestId=456&selectedTestTitle=Class+8+Maths"
  );
});

test("returns the previous-question listing with the selected paper", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/kerala-psc/previous-questions/789?type=pqp&selectedTestTitle=Previous+Year+Paper"
    ),
    "/dashboard/kerala-psc/previous-questions?selectedTestId=789&selectedTestTitle=Previous+Year+Paper"
  );
});

test("returns the relevant topic-wise and statement exam listings", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/rrb-ssc/topic-wise-exams/test/math/algebra?examId=123&selectedTestTitle=Algebra"
    ),
    "/dashboard/rrb-ssc/topic-wise-exams/test/math?selectedTestId=123&selectedTestTitle=Algebra"
  );
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/kerala-psc/statement-type-exams/degree-level/statement-exam?examId=456&selectedTestTitle=Statement+Exam"
    ),
    "/dashboard/kerala-psc/statement-type-exams/degree-level?selectedTestId=456&selectedTestTitle=Statement+Exam"
  );
});

test("preserves the selected exam in level-specific dashboard routes", () => {
  assert.equal(
    getPostLoginRedirectPath(
      "/government-exams-coaching/kerala-psc/degree-level-exams/ldc?examId=42&selectedTestTitle=Degree+Mock"
    ),
    "/dashboard/kerala-psc/degree-level-exams/ldc?selectedTestId=42&selectedTestTitle=Degree+Mock"
  );
});

test("preserves valid dashboard returns and rejects external or unknown destinations", () => {
  assert.equal(
    getPostLoginRedirectPath("/dashboard/kerala-psc/mock-tests"),
    "/dashboard/kerala-psc/mock-tests"
  );
  assert.equal(getPostLoginRedirectPath("https://example.com/"), "");
  assert.equal(getPostLoginRedirectPath("//example.com/"), "");
  assert.equal(
    getPostLoginRedirectPath("/government-exams-coaching/unknown/mock-tests/123"),
    ""
  );
});

test("preserves the exact guest handoff start route after login", () => {
  assert.equal(getPostLoginRedirectPath('/government-exams-coaching/kerala-psc/mock-tests/42/start?guestAction=pause'),
    '/dashboard/kerala-psc/mock-tests/42/start?guestAction=pause');
  assert.equal(getPostLoginRedirectPath('/dashboard/kerala-psc/previous-questions/42/start?guestAction=submit'),
    '/dashboard/kerala-psc/previous-questions/42/start?guestAction=submit');
});
