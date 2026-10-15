import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  normalizeHistoryType,
} from "@/lib/examHistoryApi";

import {
  resolveExamHistoryName,
  isSupportedExamHistoryType,
} from "@/lib/examHistoryHelper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function positiveId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request) {
  try {
    const session = await getStudentSession();

    const uid = positiveId(session?.uid);

    if (!uid) {
      return reply(
        {
          status: false,
          examName: "",
          message: "Please sign in to continue.",
        },
        401
      );
    }

    const { searchParams } = new URL(request.url);

    const cid = positiveId(
      searchParams.get("cid")
    );

    const examId = positiveId(
      searchParams.get("examId") ??
      searchParams.get("examid")
    );

    const examType = normalizeHistoryType(
      searchParams.get("examType") ??
      searchParams.get("examtype") ??
      ""
    );

    if (
      !cid ||
      !examId ||
      !isSupportedExamHistoryType(examType)
    ) {
      return reply(
        {
          status: false,
          examName: "",
          message:
            "Valid cid, examId and examType are required.",
        },
        400
      );
    }

    if (
      !process.env.PSC_API_BASE_URL ||
      !process.env.PSC_API_KEY
    ) {
      return reply(
        {
          status: false,
          examName: "",
          message:
            "PSC API configuration is missing.",
        },
        500
      );
    }

    const examName = await resolveExamHistoryName({
      cid,
      uid,
      examId,
      examType,
    });

    if (!examName) {
      return reply(
        {
          status: false,
          examName: "",
          examId,
          examType,
          message:
            "The backend did not provide an exam name.",
        },
        502
      );
    }

    return reply({
      status: true,
      examName,
      examId,
      examType,
    });
  } catch (error) {
    console.error(
      "EXAM NAME ROUTE:",
      error?.message
    );

    return reply(
      {
        status: false,
        examName: "",
        message: "Unable to resolve exam name.",
      },
      500
    );
  }
}