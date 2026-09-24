// src/app/api/exam-attempt/update/route.js

import {
  NextResponse,
} from "next/server";

import {
  updateUserExamAttempt,
} from "@/lib/examAttemptHelper";

export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    if (
      !body?.uid ||
      !body?.cid ||
      !body?.exam_id
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "uid, cid and exam_id are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await updateUserExamAttempt(
        body
      );

    return NextResponse.json(
      result,
      {
        status:
          result?.status === false
            ? 400
            : 200,
      }
    );
  } catch (error) {
    console.error(
      "update exam attempt:",
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