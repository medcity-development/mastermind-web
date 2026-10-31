
import { normalizeAttemptList } from "../utils/examHistoryUtils";

import {
  normalizeType,
  normalizeRecord,
  nameKey,
  examIdOf,
  resolveName,
  validName,
} from "../utils/examHistoryCore";

const HISTORY_TTL = 120000;
const NAME_TTL = 30 * 60 * 1000;
const NAME_FAILURE_TTL = 60000;
const DEFAULT_COOLDOWN = 60000;

const MAX_HISTORY_CACHE = 100;
const MAX_NAME_CACHE = 500;

const historyCache = new Map();
const nameCache = new Map();

const pendingHistory = new Map();
const pendingNames = new Map();

let cooldownUntil = 0;

function putCache(map, key, value, maxEntries) {
  if (map.has(key)) map.delete(key);

  map.set(key, value);

  while (map.size > maxEntries) {
    map.delete(map.keys().next().value);
  }
}

function historyKey(cid, type) {
  return `${cid}:${normalizeType(type)}`;
}

export function cooldownSeconds() {
  return Math.max(
    0,
    Math.ceil((cooldownUntil - Date.now()) / 1000)
  );
}

function retryMilliseconds(value) {
  if (value == null || String(value).trim() === "") {
    return DEFAULT_COOLDOWN;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(1000, seconds * 1000);
  }

  const date = Date.parse(value);

  return Number.isFinite(date)
    ? Math.max(1000, date - Date.now())
    : DEFAULT_COOLDOWN;
}

function applyCooldown(value) {
  cooldownUntil = Math.max(
    cooldownUntil,
    Date.now() + retryMilliseconds(value)
  );
}

function limitedError() {
  const error = new Error(
    "Exam history requests are temporarily rate-limited."
  );

  error.rateLimited = true;
  error.httpStatus = 429;
  error.retryAfter = cooldownSeconds();

  return error;
}

function checkCooldown() {
  if (cooldownSeconds() > 0) {
    throw limitedError();
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function checkRateLimit(response, data) {
  const message = String(
    data?.message ?? data?.msg ?? ""
  );

  const limited =
    response.status === 429 ||
    data?.rateLimited === true ||
    Number(data?.httpStatus) === 429 ||
    /too many requests|too many attempts|rate[\s-]?limit/i.test(
      message
    );

  if (!limited) return;

  applyCooldown(
    response.headers.get("Retry-After") ??
      data?.retryAfter ??
      data?.retry_after
  );

  throw limitedError();
}

export function getCachedHistory(cid, type) {
  return historyCache.get(historyKey(cid, type)) ?? null;
}

export async function loadHistoryType({
  cid,
  examType,
  force = false,
}) {
  const type = normalizeType(examType);
  const key = historyKey(cid, type);

  const cached = historyCache.get(key);

  if (
    !force &&
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached;
  }

  if (pendingHistory.has(key)) {
    return pendingHistory.get(key);
  }

  checkCooldown();

  const promise = (async () => {
    const endpoint =
      type === "studyplan"
        ? "/api/exam-attempt/studyplan-history"
        : "/api/exam-attempt/history";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid,
        exam_type: type,
      }),
      cache: "no-store",
    });

    const data = await readJson(response);

    checkRateLimit(response, data);

    if (!response.ok || data?.status !== true) {
      throw new Error(
        data?.message || `${type}: History unavailable.`
      );
    }

    if (data.courseFilterVerified !== true) {
      throw new Error(
        `${type}: Course verification was not confirmed.`
      );
    }

    const records = normalizeAttemptList({
      response: data,
      examType: type,
    })
      .filter(
        (record) =>
          record &&
          typeof record === "object" &&
          record._courseVerified === true
      )
      .map((record) => normalizeRecord(record, type));

    const result = {
      records,
      partialVerification:
        data.partialVerification === true,
      unresolvedCount:
        Number(data.unresolvedCount) || 0,
      expiresAt: Date.now() + HISTORY_TTL,
    };

    putCache(
      historyCache,
      key,
      result,
      MAX_HISTORY_CACHE
    );

    return result;
  })();

  pendingHistory.set(key, promise);

  try {
    return await promise;
  } finally {
    if (pendingHistory.get(key) === promise) {
      pendingHistory.delete(key);
    }
  }
}

function readCachedName(key) {
  const cached = nameCache.get(key);

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    nameCache.delete(key);
    return null;
  }

  return cached;
}

function saveName(key, value) {
  const name = validName(value);

  putCache(
    nameCache,
    key,
    {
      name,
      expiresAt:
        Date.now() +
        (name ? NAME_TTL : NAME_FAILURE_TTL),
    },
    MAX_NAME_CACHE
  );

  return name;
}

export function applyCachedNames(cid, records) {
  let changed = false;

  const next = records.map((row) => {
    const key = nameKey(cid, row);
    const existing = resolveName(row);

    if (existing && key) {
      saveName(key, existing);
    }

    const name =
      existing ||
      (key ? readCachedName(key)?.name : "") ||
      "";

    if (
      !name ||
      (row.exam_name === name &&
        row._resolvedExamName === name)
    ) {
      return row;
    }

    changed = true;

    return {
      ...row,
      exam_name: name,
      _resolvedExamName: name,
    };
  });

  return changed ? next : records;
}

export function isNameLookupNeeded(cid, row) {
  const key = nameKey(cid, row);

  return Boolean(
    key &&
      !resolveName(row) &&
      !readCachedName(key)
  );
}

export async function loadExamName(cid, row) {
  const key = nameKey(cid, row);

  if (!key) return "";

  const existing = resolveName(row);

  if (existing) {
    return saveName(key, existing);
  }

  const cached = readCachedName(key);

  if (cached) return cached.name;

  if (pendingNames.has(key)) {
    return pendingNames.get(key);
  }

  checkCooldown();

  const [, type, examId] = key.split(":");

  const query = new URLSearchParams({
    cid: String(cid),
    examId: String(examIdOf(row) ?? examId),
    examType: type,
  });

  const promise = (async () => {
    const response = await fetch(
      `/api/exam-attempt/exam-name?${query.toString()}`,
      { cache: "no-store" }
    );

    const data = await readJson(response);

    checkRateLimit(response, data);

    const name =
      response.ok && data?.status === true
        ? validName(data.examName)
        : "";

    return saveName(key, name);
  })();

  pendingNames.set(key, promise);

  try {
    return await promise;
  } finally {
    if (pendingNames.get(key) === promise) {
      pendingNames.delete(key);
    }
  }
}
