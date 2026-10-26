import "server-only";

export const ENABLE_STUDY_PLAN_HISTORY = true;

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
  studyplan: "studyplan",
};

const SUPPORTED_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "studyplan",
];

const cache = new Map();

const TTL = 30_000;
const MAX_CACHE = 200;

let cooldownUntil = 0;

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
  return [...SUPPORTED_TYPES];
}

export function isHistoryTypeEnabled(value) {
  return SUPPORTED_TYPES.includes(
    normalizeHistoryType(value)
  );
}

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
  if (!Array.isArray(rows)) return [];

  const expectedCid = Number(cid);

  if (
    !Number.isSafeInteger(expectedCid) ||
    expectedCid <= 0
  ) {
    return [];
  }

  return rows.filter((row) => {
    const found = getHistoryCourseId(row);

    return (
      found !== null &&
      found !== undefined &&
      String(found).trim() !== "" &&
      Number(found) === expectedCid
    );
  });
}

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

function retryMs(value) {
  if (value !== null && value !== undefined) {
    const seconds = Number(value);

    if (Number.isFinite(seconds)) {
      return Math.max(1000, seconds * 1000);
    }

    const date = Date.parse(value);

    if (Number.isFinite(date)) {
      return Math.max(1000, date - Date.now());
    }
  }

  return 60_000;
}

function extractRecords(value) {
  if (Array.isArray(value)) {
    return value;
  }

  const candidates = [
    value?.details,
    value?.data,
    value?.result,
    value?.data?.details,
    value?.data?.data,
    value?.result?.details,
    value?.result?.data,
  ];

  return candidates.find(Array.isArray) ?? null;
}

async function requestHistory(uid, cid, type) {
  if (!isHistoryTypeEnabled(type)) {
    return fail(
      "Unsupported exam history type.",
      400
    );
  }

  if (Date.now() < cooldownUntil) {
    return fail(
      "History backend is temporarily rate-limited.",
      429,
      Math.ceil(
        (cooldownUntil - Date.now()) / 1000
      )
    );
  }

  const base = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const api = String(
    process.env.PSC_API_KEY || ""
  ).trim();

  if (!base || !api) {
    return fail(
      "PSC API configuration is missing.",
      500
    );
  }

  const form = new FormData();

  form.append("api", api);
  form.append("uid", String(uid));
  form.append("cid", String(cid));

  form.append(
    "exam_type",
    backendHistoryType(type)
  );

  try {
    const response = await fetch(
      `${base}/getUserExamsList`,
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

      return fail(
        "History backend rate limit reached.",
        429,
        Math.ceil(
          (cooldownUntil - Date.now()) / 1000
        )
      );
    }

    const raw = await response.text();

    let result;

    try {
      result = raw ? JSON.parse(raw) : null;
    } catch {
      return fail(
        "History backend returned invalid JSON.",
        502
      );
    }

    if (!response.ok) {
      return fail(
        result?.message ||
          result?.msg ||
          `History backend HTTP ${response.status}.`,
        response.status
      );
    }

    if (
      !result ||
      [false, "false", 0, "0"].includes(
        result.status
      )
    ) {
      return fail(
        result?.message ||
          result?.msg ||
          "History backend rejected the request."
      );
    }

    const records = extractRecords(result);

    if (!records) {
      return fail(
        "History backend did not return a records array."
      );
    }

    return {
      status: true,
      exam_type: type,
      details: records,
      data: records,
      total: records.length,
      httpStatus: response.status,
    };
  } catch (error) {
    const timedOut = [
      "TimeoutError",
      "AbortError",
    ].includes(error?.name);

    console.error("[Exam History] Network error:", {
      type,
      cid,
      message: error?.message,
    });

    return fail(
      timedOut
        ? "History backend timed out."
        : "Unable to connect to history backend.",
      timedOut ? 504 : 503
    );
  }
}

export async function getCourseExamHistory({
  uid,
  cid,
  examType,
} = {}) {
  const type = normalizeHistoryType(examType);

  const safeUid = Number(uid);
  const safeCid = Number(cid);

  if (!isHistoryTypeEnabled(type)) {
    return fail(
      "Unsupported exam history type.",
      400
    );
  }

  if (
    !Number.isSafeInteger(safeUid) ||
    safeUid <= 0
  ) {
    return fail(
      "Invalid student session.",
      401
    );
  }

  if (
    !Number.isSafeInteger(safeCid) ||
    safeCid <= 0
  ) {
    return fail(
      "Invalid course ID.",
      400
    );
  }

  const key = `${safeUid}:${safeCid}:${type}`;

  const now = Date.now();
  const previous = cache.get(key);

  if (
    previous &&
    previous.expiresAt > now
  ) {
    return previous.promise;
  }

  const entry = {
    expiresAt: now + TTL,
    promise: null,
  };

  entry.promise = requestHistory(
    safeUid,
    safeCid,
    type
  ).then((result) => {
    if (
      !result.status &&
      cache.get(key) === entry
    ) {
      cache.delete(key);
    }

    return result;
  });

  cache.set(key, entry);

  if (cache.size > MAX_CACHE) {
    cache.delete(
      cache.keys().next().value
    );
  }

  return entry.promise;
}