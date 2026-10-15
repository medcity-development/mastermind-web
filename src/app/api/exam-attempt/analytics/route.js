
import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getExamAnalyticDetails,
} from "@/lib/examAttemptHelper";

export const dynamic = "force-dynamic";

const allowed = new Set([
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "twe",
  "studyplan",
]);

function fail(
  message,
  status = 400,
  retryAfter = null
) {
  return NextResponse.json(
    {
      status: false,
      message,
      details: [],
      data: [],
    },
    {
      status,
      headers: retryAfter
        ? { "Retry-After": String(retryAfter) }
        : {},
    }
  );
}

export async function POST(request) {
  try {
    const session = await getStudentSession();
    const uid = Number(session?.uid);

    if (!Number.isInteger(uid) || uid <= 0) {
      return fail("Please sign in to continue.", 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid JSON request.");
    }

    const cid = Number(body?.cid);
    const id = Number(body?.id ?? body?.attemptId);

    const examType = String(
      body?.exam_type ?? body?.examType ?? ""
    )
      .trim()
      .toLowerCase();

    if (!Number.isInteger(cid) || cid <= 0) {
      return fail("Valid course id is required.");
    }

    if (!Number.isSafeInteger(id) || id <= 0) {
      return fail("Valid saved attempt id is required.");
    }

    if (!allowed.has(examType)) {
      return fail("Unsupported exam type.");
    }

    const result = await getExamAnalyticDetails({
      uid,
      cid,
      id,
      exam_type: examType,
    });

    if (!result || result.status === false) {
      const status =
        result?.httpStatus === 429 ? 429 : 502;

      return fail(
        status === 429
          ? "Too many requests. Please try again later."
          : /Undefined variable|Fatal error|Warning:/i.test(
            String(result?.message || result?.msg || "")
          )
            ? "The exam backend could not load this attempt. Please contact support."
            : result?.message ||
            result?.msg ||
            "Unable to load saved exam result.",
        status,
        result?.retryAfter
      );
    }

    const details = Array.isArray(result.details)
      ? result.details
      : result.details &&
        typeof result.details === "object"
        ? [result.details]
        : Array.isArray(result.data)
          ? result.data
          : result.data &&
            typeof result.data === "object"
            ? [result.data]
            : [];

    return NextResponse.json({
      ...result,
      status: true,
      details,
    });
  } catch (error) {
    console.error("ANALYTICS DETAILS ROUTE:", error);

    return fail(
      "Unable to load saved exam result.",
      500
    );
  }
}
