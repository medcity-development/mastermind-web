import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  updateUserExamAttempt,
} from "@/lib/examAttemptHelper";

import {
  buildAttemptPayload,
} from "@/lib/examAttemptData";

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

    const pauseId =
      body?.pauseid;

    const examType =
      String(
        body?.exam_type ??
          ""
      ).trim();

    if (
      !Number.isFinite(cid) ||
      cid <= 0 ||
      !Number.isFinite(
        examId
      ) ||
      examId <= 0 ||
      !examType ||
      !pauseId
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Required exam information is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const payload =
      buildAttemptPayload(
        {
          ...body,

          cid,

          exam_id:
            examId,

          exam_type:
            examType,

          pauseid:
            pauseId,
        },

        uid
      );

    const result =
      await updateUserExamAttempt(
        payload
      );

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
      "UPDATE EXAM ATTEMPT:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to update exam attempt.",
      },
      {
        status: 500,
      }
    );
  }
}