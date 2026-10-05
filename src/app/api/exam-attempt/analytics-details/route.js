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

    const id =
      Number(
        body?.id ??
        body?.attemptId
      );

    const examType =
      String(
        body?.exam_type ??
        body?.examType ??
        ""
      )
        .trim()
        .toLowerCase();

    if (
      !Number.isFinite(cid) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Valid course id is required.",

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Valid saved attempt id is required.",

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

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getExamAnalyticDetails({
        uid,
        cid,
        id,

        exam_type:
          examType,
      });

    if (
      !result ||
      result?.status ===
        false
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            result?.message ||
            result?.msg ||
            "Unable to load saved exam result.",

          details: [],
        },
        {
          status: 502,
        }
      );
    }

    const details =
      Array.isArray(
        result?.details
      )
        ? result.details
        : result?.details &&
            typeof result.details ===
              "object"
          ? [
              result.details,
            ]
          : Array.isArray(
                result?.data
              )
            ? result.data
            : result?.data &&
                typeof result.data ===
                  "object"
              ? [
                  result.data,
                ]
              : [];

    return NextResponse.json(
      {
        ...result,

        status: true,

        details,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ANALYTICS DETAILS ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load saved exam result.",

        details: [],
      },
      {
        status: 500,
      }
    );
  }
}