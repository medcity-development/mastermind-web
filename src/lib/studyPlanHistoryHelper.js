import "server-only";

import {
  getCourseExamHistory,
  getHistoryCourseId,
  normalizeHistoryType,
} from "@/lib/examHistoryApi";

import {
  verifyExamHistoryCourse,
} from "@/lib/examHistoryHelper";

const MAX_WORKERS = 2;

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
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

function examNameOf(row) {
  const candidates = [
    row?._resolvedExamName,
    row?.exam_name,
    row?.examName,
    row?.exam_title,
    row?.examTitle,
    row?.test_name,
    row?.testName,
    row?.test_title,
    row?.title,
    row?.name,
    row?.exam?.exam_name,
    row?.exam?.title,
  ];

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

  for (const value of candidates) {
    if (typeof value !== "string") continue;

    const name = value.trim();

    if (name && !invalid.has(name.toLowerCase())) {
      return name;
    }
  }

  return "";
}

function resultShape(overrides = {}) {
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

async function mapWithWorkers(items, handler) {
  const output = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await handler(items[index]);
    }
  }

  const count = Math.min(
    MAX_WORKERS,
    items.length
  );

  await Promise.all(
    Array.from(
      { length: count },
      () => worker()
    )
  );

  return output;
}

export async function getStudyPlanHistory({
  uid,
  cid,
} = {}) {
  const safeUid = positiveId(uid);
  const safeCid = positiveId(cid);

  if (!safeUid || !safeCid) {
    return resultShape({
      status: false,
      message: "Valid uid and cid are required.",
      httpStatus: 400,
      courseFilterVerified: false,
    });
  }

  const history = await getCourseExamHistory({
    uid: safeUid,
    cid: safeCid,
    examType: "studyplan",
  });

  if (!history?.status) {
    return resultShape({
      status: false,
      message:
        history?.message ||
        "Unable to load Study Plan history.",
      httpStatus: history?.httpStatus || 502,
      retryAfter: history?.retryAfter ?? null,
      rateLimited: history?.rateLimited === true,
      courseFilterVerified: false,
    });
  }

  const records = Array.isArray(history.details)
    ? history.details
    : Array.isArray(history.data)
      ? history.data
      : [];

  const candidates = [];
  const unresolvedAttempts = [];
  const seen = new Set();
  const verificationCache = new Map();

  let excludedCourseCount = 0;
  let excludedUserCount = 0;
  let excludedTypeCount = 0;

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

    const attemptId = attemptIdOf(row);
    const examId = examIdOf(row);

    const rawUid =
      row.uid ??
      row.user_id ??
      row.userId;

    if (
      rawUid != null &&
      String(rawUid).trim() !== ""
    ) {
      const rowUid = positiveId(rawUid);

      if (rowUid === null) {
        unresolvedAttempts.push({
          attemptId,
          examId,
          reason: "Invalid student ID",
        });
        continue;
      }

      if (rowUid !== safeUid) {
        excludedUserCount++;
        continue;
      }
    }

    if (!attemptId) {
      unresolvedAttempts.push({
        attemptId: null,
        examId,
        reason: "Missing attempt ID",
      });
      continue;
    }

    const key = `studyplan:${attemptId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const rawCid = getHistoryCourseId(row);

    let explicitCid = null;

    if (
      rawCid != null &&
      String(rawCid).trim() !== ""
    ) {
      explicitCid = positiveId(rawCid);

      if (explicitCid === null) {
        unresolvedAttempts.push({
          attemptId,
          examId,
          reason: "Invalid course ID",
        });
        continue;
      }

      if (explicitCid !== safeCid) {
        excludedCourseCount++;
        continue;
      }
    }

    candidates.push({
      row,
      attemptId,
      examId,
      explicitCid,
    });
  }

  async function verifyCandidate(candidate) {
    const {
      row,
      attemptId,
      examId,
      explicitCid,
    } = candidate;

    if (explicitCid === safeCid) {
      return {
        ...candidate,
        verified: true,
      };
    }

    if (!examId) {
      return {
        ...candidate,
        verified: null,
      };
    }

    const key = [
      safeUid,
      safeCid,
      "studyplan",
      examId,
      attemptId,
    ].join(":");

    if (!verificationCache.has(key)) {
      const promise = Promise.resolve()
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
          console.warn(
            "[Study Plan] Verification failed:",
            {
              examId,
              attemptId,
              message: error?.message,
            }
          );

          return null;
        });

      verificationCache.set(key, promise);
    }

    const verified = await verificationCache.get(key);

    return {
      row,
      attemptId,
      examId,
      verified,
    };
  }

  const checked = await mapWithWorkers(
    candidates,
    verifyCandidate
  );

  const accepted = [];

  for (const item of checked) {
    if (item.verified === false) {
      excludedCourseCount++;
      continue;
    }

    if (item.verified !== true) {
      unresolvedAttempts.push({
        attemptId: item.attemptId,
        examId: item.examId,
        reason:
          "Course ownership could not be verified",
      });
      continue;
    }

    const name = examNameOf(item.row);

    accepted.push({
      ...item.row,

      exam_type: "studyplan",
      _examType: "studyplan",

      _historyId: item.attemptId,
      _examId: item.examId,

      exam_name: name,
      _resolvedExamName: name,

      _courseVerified: true,
    });
  }

  return resultShape({
    details: accepted,
    data: accepted,
    total: accepted.length,

    courseFilterVerified: true,

    partialVerification:
      unresolvedAttempts.length > 0,

    unresolvedCount:
      unresolvedAttempts.length,

    unresolvedAttempts,

    excludedCourseCount,
    excludedUserCount,
    excludedTypeCount,
  });
}