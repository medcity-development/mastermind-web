
import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";

import {
  getExamAnalyticDetails,
} from "@/lib/examAttemptHelper";

import {
  backendHistoryType,
  normalizeHistoryType,
  isHistoryTypeEnabled,
} from "@/lib/examHistoryApi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const n = Number(value);

  return Number.isSafeInteger(n) && n > 0
    ? n
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
      !Array.isArray(candidate)
    ) {
      return [candidate];
    }
  }

  return [];
}

function backendMessage(result) {
  const message = String(
    result?.message || result?.msg || ""
  );

  if (/Undefined variable|Fatal error|Warning:/i.test(message)) {
    return "The exam backend could not load this attempt.";
  }

  return message || "Unable to load saved exam result.";
}

function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
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
      return fail("Invalid JSON request.", 400);
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

    if (!isHistoryTypeEnabled(type)) {
      return fail("Unsupported exam type.");
    }

    const examType = backendHistoryType(type);

    const result = await getExamAnalyticDetails({
      uid,
      cid,
      id: attemptId,
      exam_type: examType,
    });

    if (!result || failed(result.status)) {
      const upstreamStatus = Number(result?.httpStatus);

      const status = [429, 503, 504].includes(upstreamStatus)
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

    const matching = details.filter((row) => {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        return false;
      }

      const returnedId =
        row.attempt_id ??
        row.attemptId ??
        row.pauseid ??
        row.pause_id ??
        row.id;

      const returnedCid =
        row.cid ??
        row.course_id ??
        row.courseId ??
        row.courseid;

      const returnedUid =
        row.uid ??
        row.user_id ??
        row.userId;

      const returnedType =
        row.exam_type ?? row.examType;

      return (
        (!hasValue(returnedId) ||
          Number(returnedId) === attemptId) &&
        (!hasValue(returnedCid) ||
          Number(returnedCid) === cid) &&
        (!hasValue(returnedUid) ||
          Number(returnedUid) === uid) &&
        (!hasValue(returnedType) ||
          backendHistoryType(returnedType) === examType)
      );
    });

    if (!matching.length) {
      return fail(
        "Saved attempt did not match the requested student, course, attempt or exam type.",
        403
      );
    }

    return reply({
      ...result,
      status: true,
      details: matching,
      data: matching,
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
