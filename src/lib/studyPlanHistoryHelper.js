import "server-only";

import {
  getCourseExamHistory,
  getHistoryCourseId,
  normalizeHistoryType,
} from "@/lib/examHistoryApi";

import {
  verifyExamHistoryCourse,
  resolveExamHistoryName,
} from "@/lib/examHistoryHelper";

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

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

function firstId(...values) {
  for (const value of values) {
    const id = positiveId(value);

    if (id !== null) {
      return id;
    }
  }

  return null;
}

/* =========================================================
   RECORD HELPERS
========================================================= */

function examIdOf(row) {
  return firstId(
    row?.exam_id,
    row?.examId,
    row?.examid,
    row?.test_id,
    row?.testId,
    row?._examId,
    row?.exam?.id
  );
}

function attemptIdOf(row) {
  return firstId(
    row?.attempt_id,
    row?.attemptId,
    row?.pauseid,
    row?.pause_id,
    row?._historyId,
    row?.id
  );
}

function nameOf(row) {
  const candidates = [
    row?._resolvedExamName,
    row?.exam_name,
    row?.examName,
    row?.exam_title,
    row?.examTitle,
    row?.test_name,
    row?.testName,
    row?.title,
    row?.name,
    row?.exam?.exam_name,
  ];

  const invalid = new Set([
    "",
    "-",
    "—",
    "null",
    "undefined",
    "unknown",
    "exam name unavailable",
  ]);

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const value = candidate.trim();

    if (
      value &&
      !invalid.has(value.toLowerCase())
    ) {
      return value;
    }
  }

  return "";
}

function getRecords(result) {
  if (Array.isArray(result?.details)) {
    return result.details;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

/* =========================================================
   RESULT STRUCTURE
========================================================= */

function emptyResult(overrides = {}) {
  return {
    status: true,
    exam_type: "studyplan",

    details: [],
    data: [],
    total: 0,

    courseFilterVerified: true,
    partialVerification: false,

    unresolvedCount: 0,
    unresolvedAttempts: [],

    excludedCourseCount: 0,
    excludedUserCount: 0,
    excludedTypeCount: 0,

    ...overrides,
  };
}

/* =========================================================
   STUDY PLAN HISTORY
========================================================= */

export async function getStudyPlanHistory({
  uid,
  cid,
} = {}) {
  const safeUid = positiveId(uid);
  const safeCid = positiveId(cid);

  if (!safeUid || !safeCid) {
    return emptyResult({
      status: false,
      message: "Valid uid and cid are required.",
      httpStatus: 400,
      courseFilterVerified: false,
    });
  }

  /* -------------------------------------------------------
     FETCH ATTEMPTS
  ------------------------------------------------------- */

  const result = await getCourseExamHistory({
    uid: safeUid,
    cid: safeCid,
    examType: "studyplan",
  });

  if (!result?.status) {
    return emptyResult({
      status: false,
      message:
        result?.message ||
        "Unable to load Study Plan history.",

      httpStatus: result?.httpStatus || 502,
      retryAfter: result?.retryAfter,

      courseFilterVerified: false,
    });
  }

  const records = getRecords(result);

  const accepted = [];
  const unresolvedAttempts = [];

  const seen = new Set();

  const verificationCache = new Map();
  const nameCache = new Map();

  let unresolvedCount = 0;
  let excludedCourseCount = 0;
  let excludedUserCount = 0;
  let excludedTypeCount = 0;

  /* -------------------------------------------------------
     RESOLVE NAME
  ------------------------------------------------------- */

  async function resolveName(row, examId) {
    const existingName = nameOf(row);

    if (existingName) {
      return existingName;
    }

    const key = `${safeUid}:${safeCid}:${examId}`;

    if (!nameCache.has(key)) {
      nameCache.set(
        key,
        Promise.resolve()
          .then(() =>
            resolveExamHistoryName({
              uid: safeUid,
              cid: safeCid,
              examId,
              examType: "studyplan",
              item: row,
            })
          )
          .catch((error) => {
            console.warn(
              "[Study Plan] Name resolution failed:",
              error?.message
            );

            return "";
          })
      );
    }

    const resolved = await nameCache.get(key);

    return typeof resolved === "string" &&
      resolved.trim()
      ? resolved.trim()
      : `Study Plan Exam ${examId}`;
  }

  /* -------------------------------------------------------
     PROCESS RECORDS
  ------------------------------------------------------- */

  for (const row of records) {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row)
    ) {
      continue;
    }

    const type = normalizeHistoryType(
      row.exam_type ??
      row.examType ??
      row.type ??
      "studyplan"
    );

    if (type !== "studyplan") {
      excludedTypeCount++;
      continue;
    }

    const rowUid = positiveId(
      row.uid ??
      row.user_id ??
      row.userId
    );

    if (
      rowUid !== null &&
      rowUid !== safeUid
    ) {
      excludedUserCount++;
      continue;
    }

    const attemptId = attemptIdOf(row);
    const examId = examIdOf(row);

    if (!attemptId || !examId) {
      unresolvedCount++;

      unresolvedAttempts.push({
        attemptId,
        examId,
        reason: "Missing attempt or exam ID",
      });

      continue;
    }

    const key = `studyplan:${attemptId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    /* -----------------------------------------------------
       COURSE VALIDATION
    ----------------------------------------------------- */

    const rawCid = getHistoryCourseId(row);
    const explicitCid = positiveId(rawCid);

    if (
      rawCid !== null &&
      rawCid !== undefined &&
      String(rawCid).trim() !== "" &&
      explicitCid === null
    ) {
      unresolvedCount++;

      unresolvedAttempts.push({
        attemptId,
        examId,
        reason: "Invalid course ID",
      });

      continue;
    }

    if (
      explicitCid !== null &&
      explicitCid !== safeCid
    ) {
      excludedCourseCount++;
      continue;
    }

    let verified = explicitCid === safeCid;

    if (!verified) {
      const verificationKey =
        `${safeUid}:${safeCid}:${examId}:${attemptId}`;

      if (!verificationCache.has(verificationKey)) {
        verificationCache.set(
          verificationKey,
          Promise.resolve()
            .then(() =>
              verifyExamHistoryCourse({
                uid: safeUid,
                cid: safeCid,
                examId,
                examType: "studyplan",
                attemptId,
              })
            )
            .catch((error) => {
              console.error(
                "[Study Plan] Course verification failed:",
                {
                  examId,
                  attemptId,
                  error: error?.message,
                }
              );

              return null;
            })
        );
      }

      verified = await verificationCache.get(
        verificationKey
      );
    }

    if (verified === false) {
      excludedCourseCount++;
      continue;
    }

    const examName = await resolveName(
      row,
      examId
    );

    /* -----------------------------------------------------
       NORMALIZE ATTEMPT
    ----------------------------------------------------- */

    const normalized = {
      ...row,

      exam_type: "studyplan",
      _examType: "studyplan",

      _historyId: attemptId,
      _examId: examId,

      exam_name: examName,
      _resolvedExamName: examName,

      _courseVerified: verified === true,
    };

    if (verified !== true) {
      unresolvedCount++;

      unresolvedAttempts.push({
        attemptId,
        examId,
        examName,
        reason:
          "Backend does not expose a verifiable course ID",
      });

      continue;
    }

    accepted.push(normalized);
  }

  /* -------------------------------------------------------
     DIAGNOSTICS
  ------------------------------------------------------- */

  if (unresolvedCount > 0) {
    console.warn(
      "[Study Plan History] Unresolved attempts:",
      JSON.stringify({
        uid: safeUid,
        cid: safeCid,
        unresolvedCount,
        unresolvedAttempts,
      })
    );
  }

  /* -------------------------------------------------------
     RESPONSE
  ------------------------------------------------------- */

  return emptyResult({
    details: accepted,
    data: accepted,
    total: accepted.length,

    courseFilterVerified:
      unresolvedCount === 0,

    partialVerification:
      unresolvedCount > 0,

    unresolvedCount,
    unresolvedAttempts,

    excludedCourseCount,
    excludedUserCount,
    excludedTypeCount,
  });
}
