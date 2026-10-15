import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getExamAnalyticDetails,
} from "@/lib/examAttemptHelper";

import {
  backendHistoryType,
  normalizeHistoryType,
} from "@/lib/examHistoryApi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowed = new Set([
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "studyplan",
]);

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function failed(value) {
  return [
    false,
    "false",
    0,
    "0",
    "error",
    "failed",
  ].includes(value);
}

function reply(body, status = 200, retryAfter = null) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(retryAfter
        ? { "Retry-After": String(retryAfter) }
        : {}),
    },
  });
}

function fail(message, status = 400, retryAfter = null) {
  return reply(
    {
      status: false,
      message,
      details: [],
      data: [],
    },
    status,
    retryAfter
  );
}

function extractDetails(result) {
  const candidates = [
    result?.details,
    result?.data?.details,
    result?.data?.data,
    result?.result?.details,
    result?.result?.data,
    result?.data,
    result?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (
        candidate.id != null ||
        candidate.attempt_id != null ||
        candidate.attemptId != null ||
        candidate.pauseid != null ||
        candidate.pause_id != null ||
        candidate.exam_id != null ||
        candidate.user_answers != null
      )
    ) {
      return [candidate];
    }
  }

  return [];
}

function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
}

function backendMessage(result) {
  const message = String(
    result?.message || result?.msg || ""
  );

  if (
    /Undefined variable|Fatal error|Warning:/i.test(
      message
    )
  ) {
    return "The exam backend could not load this attempt.";
  }

  return message || "Unable to load saved exam result.";
}

export async function POST(request) {
  try {
    const session = await getStudentSession();
    const uid = positiveId(session?.uid);

    if (!uid) {
      return fail("Please sign in to continue.", 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid JSON request.");
    }

    const cid = positiveId(body?.cid);

    const attemptId = positiveId(
      body?.id ?? body?.attemptId
    );

    const type = normalizeHistoryType(
      body?.exam_type ?? body?.examType
    );

    if (!cid) {
      return fail("Valid course ID is required.");
    }

    if (!attemptId) {
      return fail("Valid saved attempt ID is required.");
    }

    if (!allowed.has(type)) {
      return fail("Unsupported exam type.");
    }

    // Retains the entitlement restriction in your second version.
    if (type === "studyplan") {
      return fail(
        "Study Plan entitlement verification is required.",
        403
      );
    }

    // topicwise / twe → backend "twe"
    const examType = backendHistoryType(type);

    const result = await getExamAnalyticDetails({
      uid,
      cid,
      id: attemptId,
      exam_type: examType,
    });

    if (!result || failed(result.status)) {
      const upstreamStatus = Number(
        result?.httpStatus
      );

      const status = [429, 503, 504].includes(
        upstreamStatus
      )
        ? upstreamStatus
        : 502;

      return fail(
        status === 429
          ? "Too many requests. Please retry later."
          : backendMessage(result),
        status,
        result?.retryAfter
      );
    }

    const details = extractDetails(result);

    if (!details.length) {
      return fail(
        "The backend returned no saved attempt details.",
        502
      );
    }

    const mismatched = details.some((row) => {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        return true;
      }

      const returnedId =
        row.id ??
        row.attempt_id ??
        row.attemptId ??
        row.pauseid ??
        row.pause_id;

      const returnedCid =
        row.cid ??
        row.course_id ??
        row.courseId ??
        row.courseid;

      const returnedUid =
        row.uid ?? row.user_id;

      // Only exam_type is used for the returned type check.
      const returnedType = row.exam_type;

      return (
        (
          hasValue(returnedId) &&
          Number(returnedId) !== attemptId
        ) ||
        (
          hasValue(returnedCid) &&
          Number(returnedCid) !== cid
        ) ||
        (
          hasValue(returnedUid) &&
          Number(returnedUid) !== uid
        ) ||
        (
          hasValue(returnedType) &&
          backendHistoryType(returnedType) !== examType
        )
      );
    });

    if (mismatched) {
      return fail(
        "Saved attempt did not match the requested student, attempt, course or exam type.",
        502
      );
    }

    return reply({
      ...result,
      status: true,
      details,
      data: details,
    });
  } catch (error) {
    console.error(
      "ANALYTICS DETAILS ROUTE:",
      error?.message
    );

    return fail(
      "Unable to load saved exam result.",
      500
    );
  }
}