import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getCourseExamHistory,
  getHistoryCourseId,
  normalizeHistoryType,
  isHistoryTypeEnabled,
} from "@/lib/examHistoryApi";

import {
  verifyExamHistoryCourse,
  resolveExamHistoryName,
} from "@/lib/examHistoryHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function positiveId(value) {
  if (
    value == null ||
    String(value).trim() === ""
  ) {
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

function examIdOf(row) {
  return firstId(
    row.exam_id,
    row.examId,
    row.examid,
    row.test_id,
    row.testId
  );
}

function attemptIdOf(row) {
  return firstId(
    row.attempt_id,
    row.attemptId,
    row.pauseid,
    row.pause_id,
    row.id
  );
}

function reply(
  body,
  status = 200,
  retryAfter = null
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(retryAfter
        ? {
            "Retry-After": String(retryAfter),
          }
        : {}),
    },
  });
}

function fail(
  message,
  status = 500,
  retryAfter = null
) {
  return reply(
    {
      status: false,
      message,
      details: [],
      data: [],
      courseFilterVerified: false,
    },
    status,
    retryAfter
  );
}

function nameOf(row) {
  const candidates = [
    row._resolvedExamName,
    row.exam_name,
    row.examName,
    row.exam_title,
    row.examTitle,
    row.test_name,
    row.testName,
    row.test_title,
    row.title,
    row.name,
    row.exam?.exam_name,
    row.exam?.title,
  ];

  const invalid = new Set([
    "",
    "-",
    "—",
    "null",
    "undefined",
    "exam name unavailable",
  ]);

  return (
    candidates.find(
      (value) =>
        typeof value === "string" &&
        value.trim() &&
        !invalid.has(
          value.trim().toLowerCase()
        )
    )?.trim() || ""
  );
}

export async function POST(request) {
  try {
    const session = await getStudentSession();
    const uid = positiveId(session?.uid);

    if (!uid) {
      return fail(
        "Please sign in to continue.",
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail(
        "Invalid JSON request.",
        400
      );
    }

    const cid = positiveId(body?.cid);

    const examType = normalizeHistoryType(
      body?.exam_type ?? body?.examType
    );

    if (!cid) {
      return fail("Invalid course ID.", 400);
    }

    if (!isHistoryTypeEnabled(examType)) {
      return fail(
        "Unsupported exam history type.",
        400
      );
    }

    const result = await getCourseExamHistory({
      uid,
      cid,
      examType,
    });

    if (!result?.status) {
      const upstream = Number(
        result?.httpStatus
      );

      const status = [
        400,
        401,
        403,
        429,
        503,
        504,
      ].includes(upstream)
        ? upstream
        : 502;

      return fail(
        result?.message ||
          "Exam history is temporarily unavailable.",
        status,
        result?.retryAfter
      );
    }

    const rows = Array.isArray(result.details)
      ? result.details
      : Array.isArray(result.data)
        ? result.data
        : [];

    const accepted = [];
    const seen = new Set();

    const nameCache = new Map();
    const verificationCache = new Map();

    let excludedCourseCount = 0;
    let excludedTypeCount = 0;
    let excludedUserCount = 0;
    let unresolvedCount = 0;

    for (const row of rows) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        continue;
      }

      const rowType = normalizeHistoryType(
        row.exam_type ??
          row.examType ??
          row._examType ??
          examType
      );

      if (rowType !== examType) {
        excludedTypeCount++;
        continue;
      }

      const explicitCid = positiveId(
        getHistoryCourseId(row)
      );

      if (
        explicitCid !== null &&
        explicitCid !== cid
      ) {
        excludedCourseCount++;
        continue;
      }

      const rowUid = positiveId(
        row.uid ??
          row.user_id ??
          row.userId
      );

      if (
        rowUid !== null &&
        rowUid !== uid
      ) {
        excludedUserCount++;
        continue;
      }

      const examId = examIdOf(row);
      const attemptId = attemptIdOf(row);

      if (!attemptId) {
        unresolvedCount++;
        continue;
      }

      const key = `${examType}:${attemptId}`;

      if (seen.has(key)) continue;

      let verified = null;

      if (explicitCid === cid) {
        verified = true;
      } else if (examId) {
        const verificationKey =
          `${examType}:${examId}:${attemptId}`;

        if (
          !verificationCache.has(
            verificationKey
          )
        ) {
          verificationCache.set(
            verificationKey,
            Promise.resolve()
              .then(() =>
                verifyExamHistoryCourse({
                  cid,
                  uid,
                  examId,
                  examType,
                  attemptId,
                })
              )
              .catch((error) => {
                console.error(
                  "EXAM HISTORY VERIFICATION:",
                  {
                    examType,
                    examId,
                    attemptId,
                    message: error?.message,
                  }
                );

                return null;
              })
          );
        }

        verified =
          await verificationCache.get(
            verificationKey
          );
      }

      if (verified !== true) {
        if (verified === false) {
          excludedCourseCount++;
        } else {
          unresolvedCount++;
        }

        continue;
      }

      seen.add(key);

      let name = nameOf(row);

      if (!name && examId) {
        const nameKey =
          `${examType}:${examId}`;

        if (!nameCache.has(nameKey)) {
          nameCache.set(
            nameKey,
            Promise.resolve()
              .then(() =>
                resolveExamHistoryName({
                  cid,
                  uid,
                  examId,
                  examType,
                  item: row,
                })
              )
              .catch(() => "")
          );
        }

        const resolved =
          await nameCache.get(nameKey);

        name =
          typeof resolved === "string"
            ? resolved.trim()
            : "";
      }

      accepted.push({
        ...row,

        exam_type: examType,
        _examType: examType,

        _historyId: attemptId,
        _examId: examId,

        _resolvedExamName: name,
        exam_name: name || nameOf(row),

        _courseVerified: true,
      });
    }

    if (unresolvedCount > 0) {
      console.warn(
        "[Exam History] Partial verification:",
        {
          type: examType,
          cid,
          unresolvedCount,
        }
      );
    }

    return reply({
      status: true,
      exam_type: examType,

      details: accepted,
      data: accepted,
      total: accepted.length,

      courseFilterVerified: true,

      partialVerification:
        unresolvedCount > 0,

      unresolvedCount,
      excludedCourseCount,
      excludedTypeCount,
      excludedUserCount,
    });
  } catch (error) {
    console.error(
      "EXAM HISTORY ROUTE:",
      error
    );

    return fail(
      "Exam history is temporarily unavailable.",
      500
    );
  }
}