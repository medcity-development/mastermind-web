import { NextResponse } from "next/server";

import {
  getMockTestDetails,
} from "@/lib/pscApi";

export const dynamic = "force-dynamic";

function response(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function normalizeExam(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const id = positiveId(
    item.id ?? item.exam_id
  );

  if (!id) return null;

  if (
    String(item.type ?? "studyplan").toLowerCase() !==
    "studyplan"
  ) {
    return null;
  }

  return {
    id,
    exam_id: id,
    type: "studyplan",
    topicid:
      item.topicid ??
      item.topicId ??
      item.topic_id ??
      null,
    exam_name:
      item.exam_name ??
      item.title ??
      item.name ??
      "Study Plan Mock Test",
    total_questions:
      Number(item.total_questions) || 0,
    total_mark:
      Number(item.total_mark) || 0,
    total_minutes:
      Number(item.total_minutes) || 0,
    access:
      String(item.access ?? "paid").toLowerCase(),
  };
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  const cid = positiveId(params.get("cid"));
  const examId = positiveId(params.get("examId"));
  const topicId = positiveId(params.get("topicId"));

  if (!cid || !examId) {
    return response(
      {
        status: false,
        message:
          "A valid cid and linked Study Plan examId are required.",
      },
      400
    );
  }

  try {
    const result = await getMockTestDetails({
      uid: 0,
      cid,
      examId,
      type: "studyplan",
    });

    if (result?.status === false) {
      return response(
        {
          status: false,
          message:
            result.message ||
            "Unable to load Study Plan test.",
        },
        502
      );
    }

    const rawExams = Array.isArray(result?.exam)
      ? result.exam
      : result?.exam
        ? [result.exam]
        : [];

    const exam = rawExams
      .map(normalizeExam)
      .find((item) => {
        if (!item || item.id !== examId) {
          return false;
        }

        if (
          topicId &&
          item.topicid != null &&
          String(item.topicid) !== String(topicId)
        ) {
          return false;
        }

        return true;
      });

    if (!exam) {
      return response({
        status: true,
        exam: null,
        message:
          "No matching Study Plan test was returned.",
      });
    }

    return response({
      status: true,
      exam,
    });
  } catch (error) {
    console.error(
      "studyplan-mock-test:",
      error
    );

    return response(
      {
        status: false,
        message:
          "Unable to load Study Plan mock test.",
      },
      502
    );
  }
}