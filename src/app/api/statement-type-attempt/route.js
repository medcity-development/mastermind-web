import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getUserExamAttempts } from "@/lib/examAttemptHelper";
import { selectMockPausedAttempt } from "@/lib/mockPausedAttempt";

export const dynamic = "force-dynamic";

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0
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
  const session = await getStudentSession();
  const uid = positiveId(session?.uid);

  if (!uid) {
    return reply(
      { status: false, message: "Please sign in to continue." },
      401
    );
  }

  const { searchParams } = new URL(request.url);
  const cid = positiveId(searchParams.get("cid"));
  const examId = positiveId(searchParams.get("exam_id"));

  if (!cid || !examId) {
    return reply(
      { status: false, message: "Course and exam IDs are required." },
      400
    );
  }

  try {
    const result = await getUserExamAttempts({
      uid,
      cid,
      examId,
      examType: "tst",
    });

    if (
      result?.status === false &&
      (result?.message || result?.msg)
    ) {
      throw new Error(result.message || result.msg);
    }

    return reply({
      status: true,
      paused: selectMockPausedAttempt(result, {
        uid,
        cid,
        examId,
        examType: "tst",
      }),
    });
  } catch (error) {
    console.error("STATEMENT TYPE PAUSED ATTEMPT:", error);
    return reply(
      {
        status: false,
        message:
          error?.message ||
          "Unable to load saved Statement Type exam progress.",
      },
      502
    );
  }
}
