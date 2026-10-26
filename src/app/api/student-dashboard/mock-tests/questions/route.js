import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";
import {
  checkPremiumExamAccess,
} from "@/lib/premiumExamAccess";

export const dynamic = "force-dynamic";

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function backendExamType(value) {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();

  const aliases = {
    topicwise: "twe",
    "topic-wise": "twe",
    twe: "twe",
    pyq: "pqp",
    pqp: "pqp",
    study_plan: "studyplan",
    "study-plan": "studyplan",
  };

  return aliases[type] || type;
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

function fail(message, status, retryAfter = null) {
  return reply(
    {
      status: false,
      message,
      data: [],
      imagePath: "",
    },
    status,
    retryAfter
  );
}

export async function GET(request) {
  try {
    const session = await getStudentSession();
    const uid = positiveId(session?.uid);

    if (!uid) {
      return fail("Please sign in to continue.", 401);
    }

    const { searchParams } = new URL(request.url);

    const cid = positiveId(searchParams.get("cid"));

    const examId = positiveId(
      searchParams.get("examid") ??
        searchParams.get("examId")
    );

    const examType = backendExamType(
      searchParams.get("examtype") ??
        searchParams.get("examType")
    );

    if (!cid) {
      return fail("Valid cid is required.", 400);
    }

    if (!examId) {
      return fail("Valid examid is required.", 400);
    }

    if (!examType) {
      return fail("examtype is required.", 400);
    }

    const access = await checkPremiumExamAccess({
      uid,
      cid,
      examId,
      type: examType,
    });

    if (access.isPremium && !access.hasAccess) {
      return fail(
        "This premium test is not included in your active purchased plans.",
        403
      );
    }

    const apiBaseUrl = String(
      process.env.PSC_API_BASE_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

    const apiKey = String(
      process.env.PSC_API_KEY || ""
    ).trim();

    if (!apiBaseUrl || !apiKey) {
      return fail(
        "PSC API configuration is missing.",
        500
      );
    }

    const formData = new FormData();

    formData.append("api", apiKey);
    formData.append("cid", String(cid));
    formData.append("uid", String(uid));
    formData.append("examid", String(examId));

    // Topic-wise UI names must become "twe" here.
    formData.append("examtype", examType);

    const response = await fetch(
      `${apiBaseUrl}/getMockTestQuestions`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (response.status === 429) {
      return fail(
        "Question service is busy. Please try again later.",
        429,
        response.headers.get("retry-after")
      );
    }

    const rawText = await response.text();

    let result;

    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch {
      console.error("QUESTIONS API INVALID JSON:", {
        status: response.status,
        examType,
        examId,
      });

      return fail(
        "Questions API returned invalid JSON.",
        502
      );
    }

    if (
      !response.ok ||
      !result ||
      failed(result.status)
    ) {
      return fail(
        result?.message ||
          result?.msg ||
          "Unable to load exam questions.",
        502
      );
    }

    const questions = Array.isArray(result.data)
      ? result.data
      : [];

    if (!questions.length) {
      return fail(
        "The backend returned no questions for this exam.",
        502
      );
    }

    const imagePath =
      result.img_path ||
      result.imagePath ||
      result.image_path ||
      "";

    return reply({
      ...result,
      status: true,
      exam_type: examType,
      imagePath,
      img_path: imagePath,
      data: questions,
    });
  } catch (error) {
    const timedOut = [
      "TimeoutError",
      "AbortError",
    ].includes(error?.name);

    console.error("STUDENT EXAM QUESTIONS:", {
      name: error?.name,
      message: error?.message,
    });

    return fail(
      timedOut
        ? "Question service timed out. Please retry."
        : "Unable to load exam questions.",
      timedOut ? 504 : 502
    );
  }
}