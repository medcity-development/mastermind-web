// src/lib/guestExamHandoff.js

const STORAGE_KEY = "mastermind_guest_exam_handoff";
const MAX_AGE = 24 * 60 * 60 * 1000;

const ACTIONS = new Set(["pause", "submit"]);

const EXAM_TYPE_ALIASES = {
  mock: "mock",
  pqp: "pqp",
  pyq: "pqp",
  scert: "scert",
  twe: "topicwise",
  topicwise: "topicwise",
  tst: "tst",
  "statement-type": "tst",
  statementtype: "tst",
  studyplan: "studyplan",
};

const PUBLIC_BASE = "/government-exams-coaching";

function normalizeExamType(value) {
  return EXAM_TYPE_ALIASES[
    String(value ?? "").trim().toLowerCase()
  ] || null;
}

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function validSlug(value) {
  return /^[a-z0-9-]+$/i.test(String(value ?? ""));
}

function getStorage() {
  if (typeof window === "undefined") {
    throw new Error("Exam progress requires a browser.");
  }

  return window.localStorage;
}

function readRawHandoff() {
  let raw;

  try {
    raw = getStorage().getItem(STORAGE_KEY);
  } catch {
    throw new Error("Saved exam progress cannot be accessed.");
  }

  if (!raw) return null;

  try {
    const value = JSON.parse(raw);

    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new Error("Invalid saved data.");
    }

    return value;
  } catch {
    throw new Error("Saved exam progress is corrupted.");
  }
}

function validateAge(value) {
  const savedAt = Number(value?.savedAt);

  if (
    !Number.isFinite(savedAt) ||
    savedAt <= 0 ||
    savedAt > Date.now() + 60000 ||
    Date.now() - savedAt > MAX_AGE
  ) {
    throw new Error("Saved guest exam progress has expired.");
  }
}

function allowedPathPrefixes(slug, type) {
  const publicBase =
    `${PUBLIC_BASE}/${encodeURIComponent(slug)}`;

  const dashboardBase =
    `/dashboard/${encodeURIComponent(slug)}`;

  switch (type) {
    case "mock":
      return [`${publicBase}/mock-tests/`];

    case "pqp":
      return [
        `${publicBase}/previous-questions/`,
        `${dashboardBase}/previous-questions/`,
      ];

    case "scert":
      return [`${publicBase}/scert-tests/`];

    case "topicwise":
      return [
        `${publicBase}/topic-wise-exams/`,
        `${publicBase}/topic-wise-tests/`,
      ];

    case "tst":
      return [
        `${publicBase}/statement-type-exams/`,
        `${dashboardBase}/statement-type-exams/`,
      ];

    case "studyplan":
      return [
        `${publicBase}/study-plan/`,
        `${publicBase}/studyplan/`,
      ];

    default:
      return [];
  }
}

function validateReturnPath(returnPath, slug, type) {
  if (
    typeof window === "undefined" ||
    typeof returnPath !== "string" ||
    !returnPath.startsWith("/") ||
    returnPath.startsWith("//") ||
    returnPath.includes("\\")
  ) {
    return null;
  }

  try {
    const url = new URL(
      returnPath,
      window.location.origin
    );

    if (url.origin !== window.location.origin) {
      return null;
    }

    const validPrefix = allowedPathPrefixes(
      slug,
      type
    ).some((prefix) =>
      url.pathname.startsWith(prefix)
    );

    if (!validPrefix || !url.pathname.endsWith("/start")) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function buildLegacyRedirect({
  examId,
  examType,
  governmentExamsSlug,
}) {
  const slug = encodeURIComponent(governmentExamsSlug);
  const id = encodeURIComponent(String(examId));

  if (examType === "pqp") {
    return `/dashboard/${slug}/previous-questions/${id}/start`;
  }

  if (examType === "mock") {
    return `${PUBLIC_BASE}/${slug}/mock-tests/${id}/start`;
  }

  if (examType === "scert") {
    return `${PUBLIC_BASE}/${slug}/scert-tests/tests/${id}/start`;
  }

  if (examType === "topicwise") {
    return `${PUBLIC_BASE}/${slug}/topic-wise-exams/${id}/start`;
  }

  if (examType === "studyplan") {
    return `${PUBLIC_BASE}/${slug}/study-plan/${id}/start`;
  }

  throw new Error(
    "The original exam start page is required."
  );
}

export function saveGuestExamHandoff(attempt = {}) {
  const examId = positiveId(
    attempt.examId ?? attempt.exam_id
  );

  const examType = normalizeExamType(
    attempt.examType ?? attempt.exam_type
  );

  const governmentExamsSlug = String(
    attempt.governmentExamsSlug ?? ""
  ).trim();

  const action = String(
    attempt.action ?? ""
  ).toLowerCase();

  if (!examId) {
    throw new Error("Valid exam ID is required.");
  }

  if (!examType) {
    throw new Error("Unsupported exam type.");
  }

  if (!validSlug(governmentExamsSlug)) {
    throw new Error("Valid exam course slug is required.");
  }

  if (!ACTIONS.has(action)) {
    throw new Error("Invalid exam action.");
  }

  if (
    !attempt.answers ||
    typeof attempt.answers !== "object" ||
    Array.isArray(attempt.answers)
  ) {
    throw new Error("Guest exam answers are invalid.");
  }

  const returnPath =
    attempt.returnPath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "");

  const value = {
    ...attempt,
    examId: String(examId),
    examType,
    governmentExamsSlug,
    action,
    answers: { ...attempt.answers },
    returnPath:
      typeof returnPath === "string"
        ? returnPath
        : "",
    savedAt: Date.now(),
  };

  try {
    getStorage().setItem(
      STORAGE_KEY,
      JSON.stringify(value)
    );
  } catch {
    throw new Error(
      "Unable to preserve your answers. Allow browser storage and try again."
    );
  }

  return value;
}

export function readGuestExamHandoff({
  examId,
  examType,
  governmentExamsSlug,
} = {}) {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = readRawHandoff();

  if (!saved) return null;

  validateAge(saved);

  const expectedType = normalizeExamType(examType);
  const savedType = normalizeExamType(saved.examType);

  if (
    String(saved.examId) !== String(examId) ||
    savedType !== expectedType ||
    (governmentExamsSlug &&
      saved.governmentExamsSlug !== governmentExamsSlug)
  ) {
    return null;
  }

  return {
    ...saved,
    examType: savedType,
  };
}

export function guestExamLoginRedirectPath(action) {
  if (typeof window === "undefined") {
    throw new Error("Login redirect requires a browser.");
  }

  const requestedAction = String(
    action ?? ""
  ).toLowerCase();

  if (!ACTIONS.has(requestedAction)) {
    throw new Error("Invalid exam action.");
  }

  const saved = readRawHandoff();

  if (!saved) {
    throw new Error("No saved guest exam was found.");
  }

  validateAge(saved);

  const examId = positiveId(saved.examId);
  const examType = normalizeExamType(saved.examType);
  const slug = String(saved.governmentExamsSlug ?? "");

  if (
    !examId ||
    !examType ||
    !validSlug(slug) ||
    saved.action !== requestedAction
  ) {
    throw new Error("Saved exam destination is invalid.");
  }

  let url = null;

  // Statement Type always resumes inside the dashboard.
  if (examType === "tst") {
    const statementTypeSlug = String(
      saved.statementTypeSlug ?? ""
    );

    const examSlug = String(saved.examSlug ?? "");

    if (
      !validSlug(statementTypeSlug) ||
      !validSlug(examSlug)
    ) {
      throw new Error(
        "Statement Type exam route information is missing."
      );
    }

    url = new URL(
      `/dashboard/${encodeURIComponent(slug)}` +
        `/statement-type-exams/${encodeURIComponent(statementTypeSlug)}` +
        `/${encodeURIComponent(examSlug)}/start`,
      window.location.origin
    );
  } else {
    url = validateReturnPath(
      saved.returnPath,
      slug,
      examType
    );

    if (!url) {
      if (examType !== "pqp") {
        throw new Error(
          "The original exam start page was not saved. Please reopen the exam and try again."
        );
      }

      url = new URL(
        buildLegacyRedirect({
          examId,
          examType,
          governmentExamsSlug: slug,
        }),
        window.location.origin
      );
    }
  }

  if (examType !== "pqp") {
    url.searchParams.set("examId", String(examId));
  }

  url.searchParams.set("guestAction", requestedAction);

  if (saved.examTitle) {
    url.searchParams.set(
      "title",
      String(saved.examTitle)
    );
  }

  return url.pathname + url.search;
}

export function clearGuestExamHandoff() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    getStorage().removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
}

export function hasGuestExamHandoff() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const saved = readRawHandoff();

    if (!saved) return false;

    validateAge(saved);
    return true;
  } catch {
    return false;
  }
}