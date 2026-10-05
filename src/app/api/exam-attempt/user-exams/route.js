import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserExamsList,
} from "@/lib/examAttemptHelper";

export const dynamic =
  "force-dynamic";

/* =========================================================
   GET DETAILS
========================================================= */

function getDetails(
  result
) {
  if (
    Array.isArray(
      result?.details
    )
  ) {
    return result.details;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  return [];
}

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
      !Number.isFinite(
        uid
      ) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Please sign in to continue.",

          details: [],
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

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    const examType =
      String(
        body?.exam_type ??
        body?.examType ??
        ""
      )
        .trim()
        .toLowerCase();

    if (!examType) {
      return NextResponse.json(
        {
          status: false,

          message:
            "exam_type is required.",

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       BACKEND
    ===================================================== */

    const result =
      await getUserExamsList({
        uid,

        exam_type:
          examType,
      });

    const details =
      getDetails(
        result
      );

    /* =====================================================
       NO RECORDS IS VALID
    ===================================================== */

    if (
      result?.status ===
        false &&
      details.length ===
        0
    ) {
      return NextResponse.json(
        {
          status: true,

          empty: true,

          exam_type:
            examType,

          details: [],

          message:
            result?.message ??
            result?.msg ??
            "",
        },
        {
          status: 200,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        ...result,

        status: true,

        exam_type:
          examType,

        details,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "USER EXAMS ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load saved exam attempts.",

        details: [],
      },
      {
        status: 500,
      }
    );
  }
}