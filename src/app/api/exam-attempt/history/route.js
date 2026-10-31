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
} from "@/lib/examHistoryHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    if (id !== null) return id;
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
    row?._examId
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
  const values = [
    row?._resolvedExamName,
    row?.exam_name,
    row?.examName,
    row?.exam_title,
    row?.examTitle,
    row?.test_name,
    row?.testName,
    row?.test_title,
    row?.mock_name,
    row?.title,
    row?.name,
    row?.exam?.exam_name,
    row?.exam?.title,
    row?.exam_details?.exam_name,
    row?.exam_details?.title,
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

  for (const value of values) {
    if (typeof value !== "string") continue;

    const name = value.trim();

    if (name && !invalid.has(name.toLowerCase())) {
      return name;
    }
  }

  return "";
}

function reply(body, status = 200, retryAfter = null) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      ...(retryAfter != null
        ? { "Retry-After": String(retryAfter) }
        : {}),
    },
  });
}

function fail(message, status = 500, retryAfter = null) {
  return reply(
    {
      status: false,
      message,
      details: [],
      data: [],
      total: 0,
      courseFilterVerified: false,
      partialVerification: false,
      rateLimited: status === 429,
      retryAfter,
    },
    status,
    retryAfter
  );
}

async function mapWithWorkers(items, handler) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await handler(items[index]);
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          MAX_WORKERS,
          items.length
        ),
      },
      () => worker()
    )
  );

  return results;
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
      body?.exam_type ?? body?.examType ?? ""
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
      const upstream = Number(result?.httpStatus);

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
        result?.retryAfter ?? null
      );
    }

    const rows = Array.isArray(result.details)
      ? result.details
      : Array.isArray(result.data)
        ? result.data
        : [];

    const candidates = [];
    const seen = new Set();

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

      const type = normalizeHistoryType(
        row.exam_type ??
          row.examType ??
          row._examType ??
          examType
      );

      if (type !== examType) {
        excludedTypeCount++;
        continue;
      }

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
          unresolvedCount++;
          continue;
        }

        if (rowUid !== uid) {
          excludedUserCount++;
          continue;
        }
      }

      const rawCid = getHistoryCourseId(row);
      let explicitCid = null;

      if (
        rawCid != null &&
        String(rawCid).trim() !== ""
      ) {
        explicitCid = positiveId(rawCid);

        if (explicitCid === null) {
          unresolvedCount++;
          continue;
        }

        if (explicitCid !== cid) {
          excludedCourseCount++;
          continue;
        }
      }

      const attemptId = attemptIdOf(row);

      if (!attemptId) {
        unresolvedCount++;
        continue;
      }

      const key = `${examType}:${attemptId}`;

      if (seen.has(key)) continue;

      seen.add(key);

      candidates.push({
        row,
        attemptId,
        examId: examIdOf(row),
        explicitCid,
      });
    }

    const verificationCache = new Map();

    const verified = await mapWithWorkers(
      candidates,
      async (candidate) => {
        if (candidate.explicitCid === cid) {
          return {
            ...candidate,
            verified: true,
          };
        }

        if (!candidate.examId) {
          return {
            ...candidate,
            verified: null,
          };
        }

        const key = [
          uid,
          cid,
          examType,
          candidate.examId,
          candidate.attemptId,
        ].join(":");

        if (!verificationCache.has(key)) {
          verificationCache.set(
            key,
            Promise.resolve()
              .then(() =>
                verifyExamHistoryCourse({
                  cid,
                  uid,
                  examId: candidate.examId,
                  examType,
                  attemptId: candidate.attemptId,
                })
              )
              .catch((error) => {
                console.warn(
                  "[Exam History] Verification failed:",
                  {
                    examType,
                    examId: candidate.examId,
                    attemptId: candidate.attemptId,
                    message: error?.message,
                  }
                );

                return null;
              })
          );
        }

        return {
          ...candidate,
          verified:
            await verificationCache.get(key),
        };
      }
    );

    const accepted = [];

    for (const item of verified) {
      if (item.verified === false) {
        excludedCourseCount++;
        continue;
      }

      if (item.verified !== true) {
        unresolvedCount++;
        continue;
      }

      const name = nameOf(item.row);

      accepted.push({
        ...item.row,

        exam_type: examType,
        _examType: examType,

        _historyId: item.attemptId,
        _examId: item.examId,

        exam_name: name,
        _resolvedExamName: name,

        _courseVerified: true,
      });
    }

    return reply({
      status: true,
      exam_type: examType,

      details: accepted,
      data: accepted,
      total: accepted.length,

      courseFilterVerified: true,
      partialVerification: unresolvedCount > 0,

      unresolvedCount,
      excludedCourseCount,
      excludedTypeCount,
      excludedUserCount,
    });
  } catch (error) {
    console.error(
      "[Exam History] Route error:",
      error
    );

    return fail(
      "Exam history is temporarily unavailable.",
      500
    );
  }
}