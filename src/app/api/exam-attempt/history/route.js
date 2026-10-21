
import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getCourseExamHistory,
  filterExamHistoryByCourse,
  normalizeHistoryType,
} from "@/lib/examHistoryApi";

import {
  resolveExamHistoryName,
} from "@/lib/examHistoryHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =========================================================
   SUPPORTED EXAM TYPES
   Study Plan disabled
========================================================= */

const TYPES = new Set([
  "mock",
  "pqp",
  "scert",
  "topicwise",
]);

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function response(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(message, status = 500) {
  return response(
    {
      status: false,
      message,
      details: [],
      data: [],
      courseFilterVerified: false,
    },
    status
  );
}

/* =========================================================
   VALIDATE ID
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

function firstId(...values) {
  for (const value of values) {
    const number = positiveId(value);

    if (number) {
      return number;
    }
  }

  return null;
}

/* =========================================================
   EXAM / ATTEMPT IDS
========================================================= */

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

/* =========================================================
   EXAM NAME
========================================================= */

function existingName(row) {
  const values = [
    row._resolvedExamName,
    row.exam_name,
    row.examName,
    row.exam_title,
    row.examTitle,
    row.test_name,
    row.test_title,
    row.title,
    row.name,
    row.exam?.exam_name,
    row.exam?.title,
    row.exam_details?.exam_name,
    row.exam_details?.title,
  ];

  return (
    values.find(
      (value) =>
        typeof value === "string" &&
        value.trim() &&
        ![
          "-",
          "—",
          "null",
          "undefined",
          "exam name unavailable",
        ].includes(
          value.trim().toLowerCase()
        )
    )?.trim() || ""
  );
}

/* =========================================================
   POST - EXAM HISTORY
========================================================= */

export async function POST(request) {
  try {
    /* -------------------------------
       STUDENT SESSION
    -------------------------------- */

    const session =
      await getStudentSession();

    const uid =
      positiveId(session?.uid);

    if (!uid) {
      return fail(
        "Please sign in to continue.",
        401
      );
    }

    /* -------------------------------
       REQUEST BODY
    -------------------------------- */

    let body;

    try {
      body = await request.json();
    } catch {
      return fail(
        "Invalid JSON request.",
        400
      );
    }

    const cid =
      positiveId(body?.cid);

    const examType =
      normalizeHistoryType(
        body?.exam_type ??
          body?.examType
      );

    if (!cid) {
      return fail(
        "Invalid course ID.",
        400
      );
    }

    if (!TYPES.has(examType)) {
      return fail(
        "Unsupported exam history type.",
        400
      );
    }

    /* -------------------------------
       FETCH HISTORY
    -------------------------------- */

    const result =
      await getCourseExamHistory({
        uid,
        cid,
        examType,
      });

    if (!result?.status) {
      const upstream =
        Number(result?.httpStatus);

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

      console.error(
        "Exam history upstream error",
        {
          uid,
          cid,
          examType,
          upstream,
          message: result?.message,
        }
      );

      return fail(
        "Exam history is temporarily unavailable.",
        status
      );
    }

    /* -------------------------------
       NORMALIZE BACKEND DATA
    -------------------------------- */

    const rows =
      Array.isArray(result.details)
        ? result.details
        : Array.isArray(result.data)
          ? result.data
          : [];
    const courseRows =
      filterExamHistoryByCourse(rows, cid);

    const accepted = [];

    const seen = new Set();

    const nameCache = new Map();

    const excludedCourseCount =
      rows.length - courseRows.length;
    let excludedTypeCount = 0;

    /* -------------------------------
       FILTER ATTEMPTS
    -------------------------------- */

    for (const row of courseRows) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        continue;
      }

      const rowType =
        normalizeHistoryType(
          row.exam_type ??
            row.examType ??
            row._examType ??
            examType
        );

      if (rowType !== examType) {
        excludedTypeCount++;
        continue;
      }

      const examId =
        examIdOf(row);

      const attemptId =
        attemptIdOf(row);

      const key = attemptId
        ? `${examType}:${attemptId}`
        : null;

      if (
        key &&
        seen.has(key)
      ) {
        continue;
      }

      if (key) {
        seen.add(key);
      }

      /* -----------------------------
         RESOLVE EXAM NAME
      ----------------------------- */

      let name =
        existingName(row);

      if (!name && examId) {
        const cacheKey =
          `${examType}:${examId}`;

        if (!nameCache.has(cacheKey)) {
          nameCache.set(
            cacheKey,
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
              .catch((error) => {
                console.error(
                  "Exam history name lookup failed",
                  error
                );

                return "";
              })
          );
        }

        const resolved =
          await nameCache.get(
            cacheKey
          );

        name =
          typeof resolved === "string"
            ? resolved.trim()
            : "";
      }

      /* -----------------------------
         ACCEPT VALID ATTEMPT
      ----------------------------- */

      accepted.push({
        ...row,

        exam_type: examType,
        _examType: examType,

        _historyId: attemptId,
        _examId: examId,

        _resolvedExamName: name,

        exam_name:
          name || existingName(row),

        _courseVerified: true,
      });
    }

    /* -------------------------------
       SUCCESS RESPONSE
    -------------------------------- */

    return response({
      status: true,

      exam_type: examType,

      details: accepted,
      data: accepted,

      total: accepted.length,

      courseFilterVerified: true,
      partialVerification: false,
      unresolvedCount: 0,
      excludedCourseCount,
      excludedTypeCount,
    });
  } catch (error) {
    console.error(
      "Exam history route failed",
      error
    );

    return fail(
      "Exam history is temporarily unavailable.",
      500
    );
  }
}
