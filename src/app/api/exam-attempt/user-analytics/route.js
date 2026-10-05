// src/app/api/exam-attempt/user-analytics/route.js

import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserAnalytics,
} from "@/lib/examAttemptHelper";

export const dynamic =
  "force-dynamic";

export async function POST(
  request
) {
  try {
    const session =
      await getStudentSession();

    const uid =
      Number(
        session?.uid
      );

    if (
      !Number.isFinite(uid) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Please sign in to continue.",

          data: [],
          details: [],
        },
        {
          status: 401,
        }
      );
    }

    let body;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          status: false,

          message:
            "Invalid JSON request.",

          data: [],
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    const cid =
      Number(
        body?.cid
      );

    const examId =
      Number(
        body?.exam_id
      );

    const examType =
      String(
        body?.exam_type ??
          ""
      )
        .trim()
        .toLowerCase();

    if (
      !Number.isFinite(cid) ||
      cid <= 0 ||
      !Number.isFinite(
        examId
      ) ||
      examId <= 0 ||
      !examType
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Required analytics information is missing.",

          data: [],
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getUserAnalytics({
        uid,
        cid,

        exam_type:
          examType,

        exam_id:
          examId,

        ...(body?.exam_status
          ? {
              exam_status:
                body.exam_status,
            }
          : {}),
      });

    return NextResponse.json(
      result,
      {
        status:
          result?.status ===
          false
            ? 502
            : 200,
      }
    );
  } catch (error) {
    console.error(
      "USER ANALYTICS ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load analytics.",

        data: [],
        details: [],
      },
      {
        status: 500,
      }
    );
  }
}