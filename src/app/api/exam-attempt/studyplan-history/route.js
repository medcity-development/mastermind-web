import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getStudyPlanHistory,
} from "@/lib/studyPlanHistoryHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =========================================================
   HELPERS
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
      exam_type: "studyplan",
      message,
      details: [],
      data: [],
      total: 0,
      courseFilterVerified: false,
      partialVerification: false,
      unresolvedCount: 0,
    },
    status,
    retryAfter
  );
}

/* =========================================================
   POST
========================================================= */

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

    if (!cid) {
      return fail(
        "Invalid course ID.",
        400
      );
    }

    const result = await getStudyPlanHistory({
      uid,
      cid,
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
          "Study Plan history is unavailable.",
        status,
        result?.retryAfter
      );
    }

    if (result.partialVerification) {
      console.warn(
        "[Study Plan History] Unresolved attempts:",
        {
          uid,
          cid,
          unresolvedCount:
            result.unresolvedCount,
        }
      );
    }

    return reply({
      status: true,
      exam_type: "studyplan",

      details: result.details,
      data: result.data,
      total: result.total,

      courseFilterVerified:
        result.courseFilterVerified,

      partialVerification:
        result.partialVerification,

      unresolvedCount:
        result.unresolvedCount,

      excludedCourseCount:
        result.excludedCourseCount,

      excludedUserCount:
        result.excludedUserCount,

      excludedTypeCount:
        result.excludedTypeCount,
    });
  } catch (error) {
    console.error(
      "[Study Plan History] Route error:",
      error
    );

    return fail(
      "Unable to load Study Plan history.",
      500
    );
  }
}