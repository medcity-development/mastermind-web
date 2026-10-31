
import "server-only";

import {
  executePscRequest,
  setPscRateLimit,
  getPscCooldownSeconds,
  isPscRateLimited,
} from "@/lib/pscRequestManager";

export const ENABLE_STUDY_PLAN_HISTORY = true;

/* =========================================================
   EXAM TYPES
========================================================= */

const TYPE_MAP = {
  mock: "mock",
  mocktest: "mock",
  "mock test": "mock",

  pyq: "pqp",
  pqp: "pqp",

  scert: "scert",

  twe: "topicwise",
  topicwise: "topicwise",
  "topic-wise": "topicwise",
  "topic wise": "topicwise",
  topic_wise: "topicwise",

  tst: "tst",
  statement: "tst",
  statementtype: "tst",
  "statement-type": "tst",
  "statement type": "tst",

  studyplan: "studyplan",
  "study-plan": "studyplan",
  "study plan": "studyplan",
  study_plan: "studyplan",
};

const BACKEND_TYPES = {
  mock: "mock",
  pqp: "pqp",
  scert: "scert",
  topicwise: "twe",
  tst: "tst",
  studyplan: "studyplan",
};

const SUPPORTED_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "tst",
  "studyplan",
];

/* =========================================================
   CACHE CONFIGURATION
========================================================= */

const SUCCESS_TTL = 120_000;
const ERROR_TTL = 20_000;
const MAX_CACHE = 200;

const DEFAULT_RETRY_SECONDS = 60;
const REQUEST_TIMEOUT = 15000;

const cache = new Map();

/* =========================================================
   EXAM TYPE HELPERS
========================================================= */

export function normalizeHistoryType(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();

  return TYPE_MAP[key] || key;
}

export function backendHistoryType(value) {
  const type = normalizeHistoryType(value);

  return BACKEND_TYPES[type] || type;
}

export function getSupportedHistoryTypes() {
  return SUPPORTED_TYPES.filter(
    isHistoryTypeEnabled
  );
}

export function isHistoryTypeEnabled(value) {
  const type = normalizeHistoryType(value);

  if (
    type === "studyplan" &&
    !ENABLE_STUDY_PLAN_HISTORY
  ) {
    return false;
  }

  return SUPPORTED_TYPES.includes(type);
}

/* =========================================================
   VALIDATION
========================================================= */

function positiveId(value) {
  if (
    value == null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

/* =========================================================
   COURSE ID HELPERS
========================================================= */

export function getHistoryCourseId(row) {
  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row)
  ) {
    return null;
  }

  return (
    row.c_id ??
    row.cid ??
    row.course_id ??
    row.courseId ??
    row.courseid ??
    row.course?.c_id ??
    row.course?.cid ??
    row.course?.course_id ??
    row.course?.id ??
    row.course_details?.c_id ??
    row.course_details?.cid ??
    row.course_details?.course_id ??
    null
  );
}

export function filterExamHistoryByCourse(
  rows,
  cid
) {
  if (!Array.isArray(rows)) {
    return [];
  }

  const expectedCid = positiveId(cid);

  if (!expectedCid) {
    return [];
  }

  return rows.filter((row) => {
    const foundCid = positiveId(
      getHistoryCourseId(row)
    );

    return foundCid === expectedCid;
  });
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function fail(
  message,
  httpStatus = 502,
  retryAfter = null
) {
  return {
    status: false,
    message,
    details: [],
    data: [],
    total: 0,
    httpStatus,
    retryAfter,
    rateLimited: httpStatus === 429,
  };
}

function rateLimitFailure() {
  return fail(
    "History backend is temporarily rate-limited.",
    429,
    getPscCooldownSeconds() ||
      DEFAULT_RETRY_SECONDS
  );
}

/* =========================================================
   RECORD EXTRACTION
========================================================= */

function extractRecords(value) {
  if (Array.isArray(value)) {
    return value;
  }

  const candidates = [
    value?.details,
    value?.data,
    value?.result,
    value?.results,
    value?.data?.details,
    value?.data?.data,
    value?.data?.result,
    value?.result?.details,
    value?.result?.data,
  ];

  return candidates.find(
    Array.isArray
  ) ?? null;
}

/* =========================================================
   RATE LIMIT DETECTION
========================================================= */

function isRateLimitedBody(result) {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return false;
  }

  if (
    result.rateLimited === true ||
    Number(result.httpStatus) === 429 ||
    Number(result.status) === 429 ||
    Number(result.code) === 429
  ) {
    return true;
  }

  const message = String(
    result.message ??
    result.msg ??
    ""
  );

  return /too many attempts|too many requests|rate[\s-]?limit/i.test(
    message
  );
}

/* =========================================================
   BACKEND SUCCESS
========================================================= */

function isBackendSuccess(result) {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return false;
  }

  const status = result.status;

  if (
    status === false ||
    status === 0
  ) {
    return false;
  }

  if (typeof status === "string") {
    const normalized = status
      .trim()
      .toLowerCase();

    if (
      [
        "false",
        "0",
        "failed",
        "failure",
        "error",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   API CONFIG
========================================================= */

function getApiConfig() {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const apiKey = String(
    process.env.PSC_API_KEY || ""
  ).trim();

  if (!baseUrl || !apiKey) {
    return null;
  }

  return {
    baseUrl,
    apiKey,
  };
}

/* =========================================================
   REQUEST HISTORY

   Uses the shared PSC request manager.
   No independent request queue or cooldown.
========================================================= */

async function requestHistory(
  uid,
  cid,
  type
) {
  if (isPscRateLimited()) {
    return rateLimitFailure();
  }

  const config = getApiConfig();

  if (!config) {
    return fail(
      "PSC API configuration is missing.",
      500
    );
  }

  const form = new FormData();

  form.append("api", config.apiKey);
  form.append("uid", String(uid));
  form.append("cid", String(cid));
  form.append(
    "exam_type",
    backendHistoryType(type)
  );

  const requestKey = JSON.stringify({
    endpoint: "getUserExamsList",
    uid,
    cid,
    examType: backendHistoryType(type),
  });

  try {
    const response = await executePscRequest({
      key: requestKey,

      task: () =>
        fetch(
          `${config.baseUrl}/getUserExamsList`,
          {
            method: "POST",
            body: form,
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(
              REQUEST_TIMEOUT
            ),
          }
        ),
    });

    const raw = await response.text();

    let result;

    try {
      result = raw
        ? JSON.parse(raw)
        : null;
    } catch {
      return fail(
        "History backend returned invalid JSON.",
        502
      );
    }

    /* -----------------------------------------------------
       JSON BODY RATE LIMIT
    ----------------------------------------------------- */

    if (isRateLimitedBody(result)) {
      setPscRateLimit(
        response.headers.get("Retry-After") ??
        result?.retryAfter ??
        result?.retry_after
      );

      return rateLimitFailure();
    }

    /* -----------------------------------------------------
       HTTP ERROR
    ----------------------------------------------------- */

    if (!response.ok) {
      return fail(
        result?.message ||
          result?.msg ||
          `History backend HTTP ${response.status}.`,
        response.status
      );
    }

    /* -----------------------------------------------------
       BACKEND ERROR
    ----------------------------------------------------- */

    if (!isBackendSuccess(result)) {
      return fail(
        result?.message ||
          result?.msg ||
          "History backend rejected the request.",
        502
      );
    }

    /* -----------------------------------------------------
       EXTRACT ATTEMPTS
    ----------------------------------------------------- */

    const records = extractRecords(result);

    if (!records) {
      return fail(
        "History backend did not return a records array.",
        502
      );
    }

    return {
      status: true,
      exam_type: type,
      details: records,
      data: records,
      total: records.length,
      httpStatus: response.status,
      retryAfter: null,
      rateLimited: false,
    };
  } catch (error) {
    /* -----------------------------------------------------
       SHARED RATE LIMIT
    ----------------------------------------------------- */

    if (
      error?.httpStatus === 429 ||
      error?.status === 429
    ) {
      return fail(
        "History backend is temporarily rate-limited.",
        429,
        error?.retryAfter ??
          getPscCooldownSeconds() ??
          DEFAULT_RETRY_SECONDS
      );
    }

    /* -----------------------------------------------------
       NETWORK / TIMEOUT
    ----------------------------------------------------- */

    const timedOut = [
      "TimeoutError",
      "AbortError",
    ].includes(error?.name);

    console.error(
      "[Exam History] Request failed:",
      {
        type,
        cid,
        message: error?.message,
      }
    );

    return fail(
      timedOut
        ? "History backend timed out."
        : "Unable to connect to history backend.",
      timedOut ? 504 : 503
    );
  }
}

/* =========================================================
   CACHE MANAGEMENT
========================================================= */

function trimCache() {
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (
      entry.settled &&
      entry.expiresAt <= now
    ) {
      cache.delete(key);
    }
  }

  while (cache.size > MAX_CACHE) {
    const oldestKey =
      cache.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    cache.delete(oldestKey);
  }
}

/* =========================================================
   PUBLIC HISTORY API
========================================================= */

export async function getCourseExamHistory({
  uid,
  cid,
  examType,
} = {}) {
  const type = normalizeHistoryType(
    examType
  );

  const safeUid = positiveId(uid);
  const safeCid = positiveId(cid);

  if (!isHistoryTypeEnabled(type)) {
    return fail(
      "Unsupported exam history type.",
      400
    );
  }

  if (!safeUid) {
    return fail(
      "Invalid student session.",
      401
    );
  }

  if (!safeCid) {
    return fail(
      "Invalid course ID.",
      400
    );
  }

  const key = [
    safeUid,
    safeCid,
    type,
  ].join(":");

  const now = Date.now();
  const previous = cache.get(key);

  /* -------------------------------------------------------
     SHARE PENDING REQUESTS AND CACHED RESULTS
  ------------------------------------------------------- */

  if (previous) {
    if (
      !previous.settled ||
      previous.expiresAt > now
    ) {
      return previous.promise;
    }

    cache.delete(key);
  }

  /* -------------------------------------------------------
     SHARED COOLDOWN
  ------------------------------------------------------- */

  if (isPscRateLimited()) {
    return rateLimitFailure();
  }

  const entry = {
    expiresAt: now + SUCCESS_TTL,
    settled: false,
    promise: null,
  };

  entry.promise = requestHistory(
    safeUid,
    safeCid,
    type
  )
    .then((result) => {
      entry.settled = true;

      if (cache.get(key) === entry) {
        let ttl = ERROR_TTL;

        if (result.status) {
          ttl = SUCCESS_TTL;
        } else if (result.rateLimited) {
          ttl = Math.max(
            1000,
            Number(
              result.retryAfter ??
              DEFAULT_RETRY_SECONDS
            ) * 1000
          );
        }

        entry.expiresAt =
          Date.now() + ttl;
      }

      return result;
    })
    .catch((error) => {
      entry.settled = true;

      console.error(
        "[Exam History] Unexpected error:",
        error
      );

      if (cache.get(key) === entry) {
        entry.expiresAt =
          Date.now() + ERROR_TTL;
      }

      return fail(
        "Unable to retrieve exam history.",
        503
      );
    });

  cache.set(key, entry);
  trimCache();

  return entry.promise;
}
