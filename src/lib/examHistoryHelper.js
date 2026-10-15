
import "server-only";

import {
  normalizeHistoryType,
  backendHistoryType,
} from "@/lib/examHistoryApi";

import {
  getExamHistoryTypes,
} from "@/lib/examHistoryTypes";

const cache = new Map();

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 300;

let cooldownUntil = 0;

/* =========================================================
   EXAM NAME FIELDS
========================================================= */

const NAME_FIELDS = [
  "_resolvedExamName",
  "exam_name",
  "examName",
  "exam_title",
  "examTitle",
  "test_name",
  "testName",
  "test_title",
  "mock_name",
  "mockName",
  "qp_name",
  "qpName",
  "qpname",
  "question_paper_name",
  "questionPaperName",
  "title",
  "name",
];

const CONTAINERS = [
  "exam",
  "exam_details",
  "examDetails",
  "details",
  "data",
  "result",
  "results",
  "test",
  "info",
];

/* =========================================================
   ID HELPERS
========================================================= */

function positiveId(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function firstId(...values) {
  for (const value of values) {
    const found = positiveId(value);

    if (found) return found;
  }

  return null;
}

/* =========================================================
   EXAM TYPE HELPERS
========================================================= */

function typeOf(value) {
  return normalizeHistoryType(value);
}

function backendType(value) {
  return backendHistoryType(value);
}

export function isSupportedExamHistoryType(value) {
  const expected = backendType(value);

  return getExamHistoryTypes().some(
    (type) => backendType(type) === expected
  );
}

function validLookup({ cid, uid, examId }) {
  return Boolean(
    positiveId(cid) &&
    positiveId(uid) &&
    positiveId(examId)
  );
}

/* =========================================================
   EXAM NAME EXTRACTION
========================================================= */

function cleanName(value) {
  if (typeof value !== "string") return "";

  const name = value.trim();

  const invalid = new Set([
    "",
    "-",
    "—",
    "null",
    "undefined",
    "unknown",
    "n/a",
    "exam name unavailable",
  ]);

  return invalid.has(name.toLowerCase())
    ? ""
    : name;
}

function extractName(value, depth = 0) {
  if (
    !value ||
    typeof value !== "object" ||
    depth > 5
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const name = extractName(item, depth + 1);

      if (name) return name;
    }

    return "";
  }

  for (const field of [
    "exam",
    "exam_details",
    "examDetails",
  ]) {
    const name = extractName(
      value[field],
      depth + 1
    );

    if (name) return name;
  }

  for (const field of NAME_FIELDS) {
    const name = cleanName(value[field]);

    if (name) return name;
  }

  for (const field of CONTAINERS) {
    const name = extractName(
      value[field],
      depth + 1
    );

    if (name) return name;
  }

  return "";
}

/* =========================================================
   EXAM DURATION EXTRACTION
========================================================= */

function extractMinutes(value, depth = 0) {
  if (
    !value ||
    typeof value !== "object" ||
    depth > 5
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const minutes = extractMinutes(
        item,
        depth + 1
      );

      if (minutes !== null) return minutes;
    }

    return null;
  }

  const raw =
    value.total_minutes ??
    value.totalMinutes ??
    value.duration_minutes ??
    value.durationMinutes ??
    value.duration;

  if (
    raw != null &&
    raw !== "" &&
    Number.isFinite(Number(raw)) &&
    Number(raw) > 0
  ) {
    return Number(raw);
  }

  for (const field of CONTAINERS) {
    const minutes = extractMinutes(
      value[field],
      depth + 1
    );

    if (minutes !== null) return minutes;
  }

  return null;
}

/* =========================================================
   API RESPONSE HELPERS
========================================================= */

function failed(result) {
  return (
    !result ||
    [
      false,
      "false",
      0,
      "0",
      "error",
      "failed",
    ].includes(result.status)
  );
}

function retryMilliseconds(value) {
  if (value == null || value === "") {
    return 60000;
  }

  const seconds = Number(value);

  if (
    Number.isFinite(seconds) &&
    seconds >= 0
  ) {
    return Math.max(1000, seconds * 1000);
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp)
    ? Math.max(1000, timestamp - Date.now())
    : 60000;
}

/* =========================================================
   BACKEND API REQUEST
========================================================= */

async function requestApi(endpoint, payload) {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const apiKey = String(
    process.env.PSC_API_KEY || ""
  ).trim();

  if (!baseUrl || !apiKey) {
    console.error("PSC API configuration missing");
    return null;
  }

  const key = JSON.stringify([
    baseUrl,
    endpoint,
    payload,
  ]);

  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  cache.delete(key);

  if (Date.now() < cooldownUntil) {
    return null;
  }

  const entry = {
    expiresAt: Date.now() + CACHE_TTL,
    promise: null,
  };

  entry.promise = (async () => {
    try {
      const form = new FormData();

      form.append("api", apiKey);

      for (const [field, value] of Object.entries(
        payload
      )) {
        if (value != null && value !== "") {
          form.append(field, String(value));
        }
      }

      const response = await fetch(
        `${baseUrl}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: form,
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }
      );

      if (response.status === 429) {
        cooldownUntil = Math.max(
          cooldownUntil,
          Date.now() +
            retryMilliseconds(
              response.headers.get("retry-after")
            )
        );

        return null;
      }

      if (!response.ok) {
        console.warn("EXAM HISTORY API ERROR", {
          endpoint,
          status: response.status,
        });

        return null;
      }

      const result = await response.json();

      return failed(result) ? null : result;
    } catch (error) {
      console.warn("EXAM HISTORY LOOKUP", {
        endpoint,
        message: error?.message,
      });

      return null;
    }
  })();

  cache.set(key, entry);

  if (cache.size > MAX_CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }

  const result = await entry.promise;

  if (!result && cache.get(key) === entry) {
    cache.delete(key);
  }

  return result;
}

/* =========================================================
   LOAD EXAM DETAILS
========================================================= */

async function loadDetails({
  cid,
  uid,
  examId,
  examType = "mock",
} = {}) {
  if (!validLookup({ cid, uid, examId })) {
    return null;
  }

  const type = typeOf(examType);

  if (!isSupportedExamHistoryType(type)) {
    return null;
  }

  return requestApi("getMockTestDetails", {
    cid: Number(cid),
    uid: Number(uid),
    examid: Number(examId),
    type: backendType(type),
  });
}

/* =========================================================
   MOCK EXAM NAME
========================================================= */

export async function getMockExamName(options = {}) {
  return extractName(await loadDetails(options));
}

/* =========================================================
   EXAM DURATION
========================================================= */

export async function getExamHistoryDurationSeconds(
  options = {}
) {
  const minutes = extractMinutes(
    await loadDetails(options)
  );

  return minutes === null
    ? null
    : Math.round(minutes * 60);
}

/* =========================================================
   ANALYTICS EXAM NAME
========================================================= */

export async function getAnalyticsExamName({
  cid,
  uid,
  examId,
  examType,
} = {}) {
  if (!validLookup({ cid, uid, examId })) {
    return "";
  }

  const type = typeOf(examType);

  if (!isSupportedExamHistoryType(type)) {
    return "";
  }

  const result = await requestApi(
    "getUserExamAnalytics2",
    {
      cid: Number(cid),
      uid: Number(uid),
      exam_id: Number(examId),
      exam_type: backendType(type),
    }
  );

  return extractName(result);
}

/* =========================================================
   RESOLVE EXAM HISTORY NAME
========================================================= */

export async function resolveExamHistoryName({
  cid,
  uid,
  examId,
  examType,
  item,
} = {}) {
  const existingName = extractName(item);

  if (existingName) return existingName;

  const type = typeOf(
    examType ??
    item?.exam_type ??
    item?._examType
  );

  if (!isSupportedExamHistoryType(type)) {
    return "";
  }

  const resolvedId = firstId(
    examId,
    item?.exam_id,
    item?.examId,
    item?.examid,
    item?.test_id,
    item?.testId
  );

  if (!resolvedId) return "";

  const analyticsName = await getAnalyticsExamName({
    cid,
    uid,
    examId: resolvedId,
    examType: type,
  });

  if (analyticsName) return analyticsName;

  return extractName(
    await loadDetails({
      cid,
      uid,
      examId: resolvedId,
      examType: type,
    })
  );
}

/* =========================================================
   EXTRACT API ROWS
========================================================= */

function extractRows(response) {
  const candidates = [
    response?.details,
    response?.data,
    response?.result,
    response?.results,
    response?.data?.details,
    response?.data?.data,
    response?.result?.details,
    response?.result?.data,
  ];

  const rows = [];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      rows.push(...candidate);
    } else if (
      candidate &&
      typeof candidate === "object"
    ) {
      rows.push(candidate);
    }
  }

  return rows;
}

/* =========================================================
   GET COURSE ID
========================================================= */

function getCourseId(row) {
  return firstId(
    row?.cid,
    row?.course_id,
    row?.courseId,
    row?.courseid,
    row?.course?.cid,
    row?.course?.id,
    row?.course_details?.cid,
    row?.course_details?.course_id
  );
}

/* =========================================================
   VERIFY EXAM HISTORY COURSE

   Returns:
   true  = course positively verified
   false = explicit course mismatch
   null  = insufficient information

   Missing course data must not be treated
   as a confirmed course match.
========================================================= */

export async function verifyExamHistoryCourse({
  cid,
  uid,
  examId,
  examType,
  attemptId,
} = {}) {
  const safeCid = positiveId(cid);
  const safeUid = positiveId(uid);
  const safeExamId = positiveId(examId);
  const safeAttemptId = positiveId(attemptId);

  if (
    !safeCid ||
    !safeUid ||
    !safeExamId ||
    !safeAttemptId
  ) {
    return null;
  }

  const type = typeOf(examType);

  if (!isSupportedExamHistoryType(type)) {
    return false;
  }

  const response = await requestApi(
    "getExamAnalyticDetails",
    {
      cid: safeCid,
      uid: safeUid,
      id: safeAttemptId,
      exam_type: backendType(type),
    }
  );

  if (!response) {
    console.warn("EXAM VERIFICATION UNAVAILABLE", {
      cid: safeCid,
      examType: type,
      examId: safeExamId,
      attemptId: safeAttemptId,
    });

    return null;
  }

  const rows = extractRows(response);

  if (!rows.length) {
    return null;
  }

  let foundMatchingIdentity = false;
  let foundCourseMismatch = false;

  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row)
    ) {
      continue;
    }

    const rowAttemptId = firstId(
      row.id,
      row.attempt_id,
      row.attemptId,
      row.pauseid,
      row.pause_id
    );

    const rowExamId = firstId(
      row.exam_id,
      row.examId,
      row.examid,
      row.test_id,
      row.testId
    );

    const rowUid = firstId(
      row.uid,
      row.user_id,
      row.userId
    );

    const rawType =
      row.exam_type ??
      row.examType ??
      null;

    // Ignore unrelated records in nested responses.

    if (
      rowAttemptId !== null &&
      rowAttemptId !== safeAttemptId
    ) {
      continue;
    }

    if (
      rowExamId !== null &&
      rowExamId !== safeExamId
    ) {
      continue;
    }

    if (
      rowUid !== null &&
      rowUid !== safeUid
    ) {
      continue;
    }

    if (
      rawType != null &&
      backendType(rawType) !== backendType(type)
    ) {
      continue;
    }

    // Require at least one matching identifier.

    if (
      rowAttemptId === null &&
      rowExamId === null
    ) {
      continue;
    }

    foundMatchingIdentity = true;

    const rowCid = getCourseId(row);

    if (rowCid === safeCid) {
      return true;
    }

    if (rowCid !== null) {
      foundCourseMismatch = true;
    }
  }

  if (
    foundMatchingIdentity &&
    foundCourseMismatch
  ) {
    return false;
  }

  console.warn("EXAM COURSE NOT CONFIRMED", {
    cid: safeCid,
    examType: type,
    examId: safeExamId,
    attemptId: safeAttemptId,
    reason: "Analytics response lacks course evidence",
  });

  return null;
}
