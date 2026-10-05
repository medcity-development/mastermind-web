// src/app/api/exam-attempt/analytics/route.js

import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getExamAnalyticDetails,
} from "@/lib/examAttemptHelper";

export const dynamic =
  "force-dynamic";

/* =========================================================
   POST
========================================================= */

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
          details: [],
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       REQUEST BODY
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
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALUES
    ===================================================== */

    const cid =
      Number(
        body?.cid
      );

    const attemptId =
      body?.id;

    const examType =
      String(
        body?.exam_type ??
          ""
      )
        .trim()
        .toLowerCase();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !Number.isFinite(cid) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Valid course id is required.",

          data: [],
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    if (!examType) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Exam type is required.",

          data: [],
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * getExamAnalyticDetails requires
     * a saved attempt id.
     *
     * It cannot produce the complete
     * Exam Analysis list without id.
     */
    if (!attemptId) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Attempt id is required to load saved exam analytics.",

          data: [],
          details: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DATABASE RESULT
    ===================================================== */

    const result =
      await getExamAnalyticDetails({
        uid,

        cid,

        id:
          attemptId,

        exam_type:
          examType,
      });

    /* =====================================================
       FAILURE
    ===================================================== */

    if (
      result?.status ===
      false
    ) {
      return NextResponse.json(
        {
          ...result,

          status: false,

          message:
            result?.message ||
            result?.msg ||
            "Unable to load saved exam analytics.",
        },
        {
          status: 502,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "EXAM ANALYTICS ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load saved exam analytics.",

        data: [],
        details: [],
      },
      {
        status: 500,
      }
    );
  }
}