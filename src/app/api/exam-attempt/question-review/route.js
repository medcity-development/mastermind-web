import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getExamAnalyticDetails,
} from "@/lib/examAttemptHelper";

import {
  normalizeHistoryType,
  backendHistoryType,
} from "@/lib/examHistoryApi";

import {
  getTopicWiseExamQuestions,
} from "@/lib/topicWiseExamHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TYPES = new Set([
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "studyplan",
]);

const id = (v) => {
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0
    ? n
    : null;
};

const send = (body, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

const fail = (message, status = 400) =>
  send(
    {
      status: false,
      message,
    },
    status
  );

const failed = (result) =>
  !result ||
  [
    false,
    "false",
    0,
    "0",
    "failed",
    "error",
  ].includes(result.status);

function extractRows(result) {
  const values = [
    result?.details,
    result?.data?.details,
    result?.data?.data,
    result?.data,
    result?.result?.details,
    result?.result?.data,
    result?.result,
  ];

  for (const value of values) {
    if (
      Array.isArray(value) &&
      value.length
    ) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (
        value.id != null ||
        value.attempt_id != null ||
        value.pauseid != null ||
        value.exam_id != null ||
        value.user_answers != null
      )
    ) {
      return [value];
    }
  }

  return [];
}

function matches(
  row,
  { uid, cid, attemptId, type }
) {
  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row)
  ) {
    return false;
  }

  const rowId =
    row.attempt_id ??
    row.attemptId ??
    row.pauseid ??
    row.pause_id ??
    row.id;

  const owner =
    row.uid ??
    row.user_id ??
    row.userId;

  const course =
    row.cid ??
    row.course_id ??
    row.courseId ??
    row.courseid;

  const rowType =
    row.exam_type ??
    row.examType;

  return (
    (rowId == null || Number(rowId) === attemptId) &&
    (owner == null || Number(owner) === uid) &&
    (course == null || Number(course) === cid) &&
    (
      rowType == null ||
      backendHistoryType(rowType) ===
        backendHistoryType(type)
    )
  );
}

async function fetchQuestionPaper({
  uid,
  cid,
  examId,
  type,
}) {
  if (type === "topicwise") {
    const result = await getTopicWiseExamQuestions({
      uid,
      cid,
      examId,
      examType: "twe",
    });

    if (failed(result)) {
      throw new Error(
        result?.message ||
          "Unable to load topic-wise questions."
      );
    }

    return {
      questions: Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.questions)
          ? result.questions
          : [],
      imagePath:
        result.imagePath ??
        result.img_path ??
        "",
    };
  }

  const base = String(
    process.env.PSC_API_BASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const api = String(
    process.env.PSC_API_KEY || ""
  ).trim();

  if (!base || !api) {
    throw new Error(
      "PSC API configuration is missing."
    );
  }

  const form = new FormData();

  form.append("api", api);
  form.append("uid", String(uid));
  form.append("cid", String(cid));
  form.append("examid", String(examId));
  form.append("examtype", backendHistoryType(type));

  const response = await fetch(
    `${base}/getMockTestQuestions`,
    {
      method: "POST",
      body: form,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20000),
    }
  );

  const raw = await response.text();

  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(
      "Question backend returned invalid JSON."
    );
  }

  if (
    !response.ok ||
    failed(result)
  ) {
    throw new Error(
      result?.message ||
        result?.msg ||
        "Original question paper could not be loaded."
    );
  }

  return {
    questions: Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.details)
        ? result.details
        : [],
    imagePath:
      result.img_path ??
      result.imagePath ??
      result.image_path ??
      "",
  };
}

export async function POST(request) {
  try {
    const session = await getStudentSession();
    const uid = id(session?.uid);

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
      return fail("Invalid JSON request.");
    }

    const cid = id(body?.cid);

    const attemptId = id(
      body?.attemptId ?? body?.id
    );

    const type = normalizeHistoryType(
      body?.examType ?? body?.exam_type
    );

    if (
      !cid ||
      !attemptId ||
      !TYPES.has(type)
    ) {
      return fail(
        "Invalid course, attempt ID or exam type."
      );
    }

    const result = await getExamAnalyticDetails({
      uid,
      cid,
      id: attemptId,
      exam_type: backendHistoryType(type),
    });

    if (failed(result)) {
      const upstream = Number(result?.httpStatus);

      return fail(
        result?.message ||
          result?.msg ||
          "Saved attempt unavailable.",
        [429, 503, 504].includes(upstream)
          ? upstream
          : 502
      );
    }

    const attempt = extractRows(result).find(
      (row) =>
        matches(row, {
          uid,
          cid,
          attemptId,
          type,
        })
    );

    if (!attempt) {
      return fail(
        "Selected saved attempt was not returned.",
        404
      );
    }

    const examId = id(
      attempt.exam_id ??
        attempt.examId ??
        attempt.examid ??
        attempt.test_id ??
        attempt.testId
    );

    if (!examId) {
      return fail(
        "Original exam ID is missing.",
        422
      );
    }

    let paper = {
      questions: [],
      imagePath: "",
    };

    let questionError = "";

    try {
      paper = await fetchQuestionPaper({
        uid,
        cid,
        examId,
        type,
      });

      if (!paper.questions.length) {
        questionError =
          "The question API returned an empty paper.";
      }
    } catch (error) {
      questionError =
        error?.message ||
        "Question paper unavailable.";

      console.error(
        "QUESTION PAPER",
        type,
        examId,
        questionError
      );
    }

    return send({
      status: true,
      attemptId,
      examId,
      examType: type,
      attempt,
      questions: paper.questions,
      imagePath: paper.imagePath,
      questionError,
    });
  } catch (error) {
    console.error(
      "QUESTION REVIEW",
      error
    );

    return fail(
      "Unable to load exam review.",
      500
    );
  }
}