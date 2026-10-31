
import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  createUserExamAttempt,
  updateUserExamAttempt,
} from "@/lib/examAttemptHelper";

import {
  checkPremiumExamAccess,
} from "@/lib/premiumExamAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function fail(message, status = 400) {
  return NextResponse.json(
    { status: false, message },
    { status }
  );
}

function normalizeAnswer(value) {
  if (value == null || String(value).trim() === "") {
    return "";
  }

  return String(value).trim();
}

function correctAnswerOf(question) {
  return normalizeAnswer(
    question?.correct_answer ??
    question?.correct_option ??
    question?.right_answer ??
    question?.answer ??
    question?.correctAnswer
  );
}

function isSuccess(result) {
  const status = result?.status;

  return (
    status === true ||
    status === 1 ||
    status === "1" ||
    status === "true" ||
    status === "success"
  );
}

async function loadTrustedQuestions({
  uid,
  cid,
  examId,
}) {
  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    throw new Error("PSC API configuration is missing.");
  }

  const formData = new FormData();

  formData.append("api", apiKey);
  formData.append("uid", String(uid));
  formData.append("cid", String(cid));
  formData.append("examid", String(examId));
  formData.append("examtype", "mock");

  const baseUrl = String(apiBaseUrl)
    .trim()
    .replace(/\/+$/, "");

  const response = await fetch(
    `${baseUrl}/getMockTestQuestions`,
    {
      method: "POST",
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to verify Mock Test questions."
    );
  }

  const result = await response.json();

  if (
    result?.status === false ||
    result?.status === 0 ||
    result?.status === "0"
  ) {
    throw new Error(
      result?.message ||
      "Mock Test questions are unavailable."
    );
  }

  const questions = Array.isArray(result?.data)
    ? result.data
    : [];

  if (questions.length === 0) {
    throw new Error("No Mock Test questions found.");
  }

  return questions;
}

export async function POST(request) {
  try {
    const session = await getStudentSession();
    const uid = positiveId(session?.uid);

    if (!uid || session?.stage !== "completed") {
      return fail(
        "Please log in and complete your profile.",
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.");
    }

    const cid = positiveId(body?.cid);
    const examId = positiveId(
      body?.exam_id ?? body?.examId
    );

    const action = String(
      body?.action || "create"
    ).toLowerCase();

    const examStatus = String(
      body?.exam_status || ""
    ).toLowerCase();

    const pauseid = positiveId(body?.pauseid);

    if (!cid || !examId) {
      return fail("Course ID and exam ID are required.");
    }

    if (!["create", "update"].includes(action)) {
      return fail("Invalid attempt action.");
    }

    if (!["pause", "finish"].includes(examStatus)) {
      return fail("Invalid exam status.");
    }

    if (action === "update" && !pauseid) {
      return fail("Saved attempt ID is required.");
    }

    const remainingSeconds = Number(
      body?.remaining_seconds
    );

    const startTime = Number(body?.start_time);

    if (
      !Number.isFinite(remainingSeconds) ||
      remainingSeconds < 0 ||
      remainingSeconds > 86400 ||
      !Number.isFinite(startTime) ||
      startTime <= 0
    ) {
      return fail("Invalid exam timing information.");
    }

    const submittedAnswers = body?.answers;

    if (
      !submittedAnswers ||
      typeof submittedAnswers !== "object" ||
      Array.isArray(submittedAnswers)
    ) {
      return fail("Invalid answer data.");
    }

    const access = await checkPremiumExamAccess({
      uid,
      cid,
      examId,
      type: "mock",
    });

    if (access.isPremium && !access.hasAccess) {
      return fail(
        "You do not have access to this Mock Test.",
        403
      );
    }

    const questions = await loadTrustedQuestions({
      uid,
      cid,
      examId,
    });

    const questionIds = [];
    const userAnswers = [];
    const correctAnswers = [];

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      const questionId = positiveId(question?.id);

      if (!questionId) {
        return fail(
          "Mock Test contains an invalid question ID.",
          502
        );
      }

      const correctAnswer = correctAnswerOf(question);

      if (!correctAnswer) {
        return fail(
          "The backend did not provide a verifiable answer key.",
          502
        );
      }

      questionIds.push(questionId);
      userAnswers.push(
        normalizeAnswer(
          submittedAnswers[String(questionId)]
        )
      );
      correctAnswers.push(correctAnswer);
    }

    const payload = {
      uid,
      cid,
      exam_id: examId,
      exam_type: "mock",
      exam_status: examStatus,
      question_ids: questionIds,
      user_answers: userAnswers,
      correct_answers: correctAnswers,
      start_time: startTime,
      paused_time: Math.round(remainingSeconds),
      ...(action === "update" ? { pauseid } : {}),
    };

    const result =
      action === "update"
        ? await updateUserExamAttempt(payload)
        : await createUserExamAttempt(payload);

    if (!isSuccess(result)) {
      return fail(
        result?.message ||
        "Unable to save Mock Test attempt.",
        502
      );
    }

    const savedAttemptId = positiveId(
      result?.pauseid ??
      result?.attempt_id ??
      result?.id ??
      result?.data?.pauseid ??
      result?.data?.id
    );

    const response = {
      ...result,
      status: true,
      exam_type: "mock",
      exam_status: examStatus,
      pauseid: savedAttemptId ?? pauseid ?? null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Mock attempt route:", error);

    return fail(
      error?.message ||
      "Failed to save Mock Test attempt.",
      500
    );
  }
}
