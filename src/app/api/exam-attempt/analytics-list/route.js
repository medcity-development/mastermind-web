// src/app/api/exam-attempt/analytics-list/route.js

import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserExamList,
} from "@/lib/examAttemptHelper";

export const dynamic =
  "force-dynamic";

export async function POST(
  request
) {
  try {
    /* =====================================================
       SESSION
    ===================================================== */

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
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

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
        },
        {
          status: 400,
        }
      );
    }

    const examType =
      String(
        body?.exam_type ??
          ""
      )
        .trim()
        .toLowerCase();

    if (!examType) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Exam type is required.",

          data: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DATABASE LIST

       IMPORTANT:
       getUserExamList does NOT need cid.
    ===================================================== */

    const result =
      await getUserExamList({
        uid,

        exam_type:
          examType,
      });

    if (
      result?.status ===
      false
    ) {
      return NextResponse.json(
        result,
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ANALYTICS LIST ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load exam attempts.",

        data: [],
      },
      {
        status: 500,
      }
    );
  }
}