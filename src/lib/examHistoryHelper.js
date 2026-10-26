import "server-only";

import {
  normalizeHistoryType,
  backendHistoryType,
  getHistoryCourseId,
  isHistoryTypeEnabled,
} from "@/lib/examHistoryApi";

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 300;

let cooldownUntil = 0;

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

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const n = Number(value);

  return Number.isSafeInteger(n) && n > 0
    ? n
    : null;
}

function firstId(...values) {
  for (const value of values) {
    const id = positiveId(value);
    if (id) return id;
  }

  return null;
}

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
  if (!value || depth > 5) return "";

  if (Array.isArray(value)) {
    for (const item of value) {
      const name = extractName(item, depth + 1);
      if (name) return name;
    }

    return "";
  }

  if (typeof value !== "object") return "";

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

function extractRows(response) {
  const candidates = [
    response?.details,
    response?.data,
    response?.result,
    response?.results,
    response?.exam,
    response?.exam_details,
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

function retryMs(value) {
  const seconds = Number(value);

  if (
    value != null &&
    value !== "" &&
    Number.isFinite(seconds)
  ) {
    return Math.max(1000, seconds * 1000);
  }

  const date = Date.parse(value);

  return Number.isFinite(date)
    ? Math.max(1000, date - Date.now())
    : 60000;
}

async function requestApi(endpoint, payload) {
  const base = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const api = String(
    process.env.PSC_API_KEY || ""
  ).trim();

  if (!base || !api) {
    console.error("PSC API configuration missing");
    return null;
  }

  const key = JSON.stringify([
    base,
    endpoint,
    payload,
  ]);

  const existing = cache.get(key);

  if (
    existing &&
    existing.expiresAt > Date.now()
  ) {
    return existing.promise;
  }

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
      form.append("api", api);

      for (const [field, value] of Object.entries(
        payload
      )) {
        if (value != null && value !== "") {
          form.append(field, String(value));
        }
      }

      const response = await fetch(
        `${base}/${endpoint}`,
        {
          method: "POST",
          body: form,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (response.status === 429) {
        cooldownUntil = Math.max(
          cooldownUntil,
          Date.now() +
            retryMs(
              response.headers.get("retry-after")
            )
        );

        return null;
      }

      if (!response.ok) return null;

      const result = await response.json();

      if (
        !result ||
        [false, "false", 0, "0"].includes(
          result.status
        )
      ) {
        return null;
      }

      return result;
    } catch (error) {
      console.warn("EXAM HISTORY LOOKUP:", {
        endpoint,
        message: error?.message,
      });

      return null;
    }
  })();

  cache.set(key, entry);

  if (cache.size > MAX_CACHE_SIZE) {
    cache.delete(
      cache.keys().next().value
    );
  }

  const result = await entry.promise;

  if (!result && cache.get(key) === entry) {
    cache.delete(key);
  }

  return result;
}

function validLookup({ cid, uid, examId }) {
  return Boolean(
    positiveId(cid) &&
    positiveId(uid) &&
    positiveId(examId)
  );
}

export function isSupportedExamHistoryType(value) {
  return isHistoryTypeEnabled(value);
}

async function loadDetails({
  cid,
  uid,
  examId,
  examType = "mock",
} = {}) {
  if (!validLookup({ cid, uid, examId })) {
    return null;
  }

  const type = normalizeHistoryType(examType);

  if (!isHistoryTypeEnabled(type)) {
    return null;
  }

  return requestApi("getMockTestDetails", {
    cid: Number(cid),
    uid: Number(uid),
    examid: Number(examId),
    type: backendHistoryType(type),
  });
}

export async function getMockExamName(
  options = {}
) {
  return extractName(
    await loadDetails(options)
  );
}

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

async function loadUserAnalytics({
  cid,
  uid,
  examId,
  examType,
}) {
  if (!validLookup({ cid, uid, examId })) {
    return null;
  }

  const type = normalizeHistoryType(examType);

  if (!isHistoryTypeEnabled(type)) {
    return null;
  }

  return requestApi("getUserExamAnalytics2", {
    cid: Number(cid),
    uid: Number(uid),
    exam_id: Number(examId),
    exam_type: backendHistoryType(type),
  });
}

export async function getAnalyticsExamName({
  cid,
  uid,
  examId,
  examType,
} = {}) {
  const result = await loadUserAnalytics({
    cid,
    uid,
    examId,
    examType,
  });

  return extractName(result);
}

export async function resolveExamHistoryName({
  cid,
  uid,
  examId,
  examType,
  item,
} = {}) {
  const existing = extractName(item);

  if (existing) return existing;

  const type = normalizeHistoryType(
    examType ??
      item?.exam_type ??
      item?._examType
  );

  const resolvedId = firstId(
    examId,
    item?.exam_id,
    item?.examId,
    item?.examid,
    item?.test_id,
    item?.testId
  );

  if (
    !resolvedId ||
    !isHistoryTypeEnabled(type)
  ) {
    return "";
  }

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

function getMatchingExam(
  response,
  examId,
  examType
) {
  const expectedId = positiveId(examId);
  const expectedType = backendHistoryType(
    examType
  );

  if (!expectedId) return null;

  const candidates = [
    response?.exam,
    response?.exam_details,
    response?.examDetails,
    response?.details,
  ];

  for (const candidate of candidates) {
    const rows = Array.isArray(candidate)
      ? candidate
      : candidate &&
          typeof candidate === "object"
        ? [candidate]
        : [];

    for (const exam of rows) {
      if (!exam || typeof exam !== "object") {
        continue;
      }

      const returnedId = firstId(
        exam.id,
        exam.exam_id,
        exam.examId,
        exam.examid
      );

      const returnedType =
        exam.type ??
        exam.exam_type ??
        exam.examType;

      if (
        returnedId === expectedId &&
        (
          returnedType == null ||
          backendHistoryType(returnedType) ===
            expectedType
        )
      ) {
        return exam;
      }
    }
  }

  return null;
}

function identityMatches({
  row,
  attemptId,
  examId,
  uid,
  examType,
}) {
  const returnedAttemptId = firstId(
    row.attempt_id,
    row.attemptId,
    row.pauseid,
    row.pause_id,
    row.id
  );

  if (returnedAttemptId !== attemptId) {
    return false;
  }

  const returnedExamId = firstId(
    row.exam_id,
    row.examId,
    row.examid,
    row.test_id,
    row.testId
  );

  if (
    returnedExamId !== null &&
    returnedExamId !== examId
  ) {
    return false;
  }

  const returnedUid = firstId(
    row.uid,
    row.user_id,
    row.userId
  );

  if (
    returnedUid !== null &&
    returnedUid !== uid
  ) {
    return false;
  }

  const returnedType =
    row.exam_type ?? row.examType;

  if (
    returnedType != null &&
    backendHistoryType(returnedType) !==
      backendHistoryType(examType)
  ) {
    return false;
  }

  return true;
}

/**
 * true  = positively verified course
 * false = explicit course mismatch
 * null  = insufficient evidence
 */
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

  const type = normalizeHistoryType(examType);

  if (!isHistoryTypeEnabled(type)) {
    return false;
  }

  // Step 1: Confirm saved attempt identity.
  const saved = await requestApi(
    "getExamAnalyticDetails",
    {
      cid: safeCid,
      uid: safeUid,
      id: safeAttemptId,
      exam_type: backendHistoryType(type),
    }
  );

  let identityVerified = false;

  if (saved) {
    for (const row of extractRows(saved)) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        continue;
      }

      if (
        !identityMatches({
          row,
          attemptId: safeAttemptId,
          examId: safeExamId,
          uid: safeUid,
          examType: type,
        })
      ) {
        continue;
      }

      identityVerified = true;

      const returnedCid = positiveId(
        getHistoryCourseId(row)
      );

      if (
        returnedCid !== null &&
        returnedCid !== safeCid
      ) {
        return false;
      }

      if (returnedCid === safeCid) {
        return true;
      }

      break;
    }
  }

  // Step 2: Check the original exam's course.
  // This is independent of the saved attempt lookup.
  const details = await loadDetails({
    cid: safeCid,
    uid: safeUid,
    examId: safeExamId,
    examType: type,
  });

  const matchingExam = details
    ? getMatchingExam(
        details,
        safeExamId,
        type
      )
    : null;

  if (matchingExam) {
    const examCid = positiveId(
      getHistoryCourseId(matchingExam)
    );

    if (
      examCid !== null &&
      examCid !== safeCid
    ) {
      return false;
    }

    if (
      identityVerified &&
      examCid === safeCid
    ) {
      return true;
    }
  }

  // Step 3: Study Plan analytics.
  // Only explicit attempt + course identity can
  // establish course ownership.
  if (type === "studyplan") {
    const analytics = await loadUserAnalytics({
      cid: safeCid,
      uid: safeUid,
      examId: safeExamId,
      examType: type,
    });

    for (const row of extractRows(analytics)) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        continue;
      }

      const analyticsId = firstId(
        row.attempt_id,
        row.attemptId,
        row.pauseid,
        row.pause_id,
        row.id
      );

      if (analyticsId !== safeAttemptId) {
        continue;
      }

      const returnedCid = positiveId(
        getHistoryCourseId(row)
      );

      if (
        returnedCid !== null &&
        returnedCid !== safeCid
      ) {
        return false;
      }

      if (
        returnedCid === safeCid &&
        identityVerified
      ) {
        return true;
      }
    }
  }

  return null;
}