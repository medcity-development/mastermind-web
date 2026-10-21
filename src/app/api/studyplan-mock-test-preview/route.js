
import { NextResponse } from "next/server";
import { getMockTestDetails } from "@/lib/pscApi";

export const dynamic = "force-dynamic";

function fail(message, status = 400) {
  return NextResponse.json(
    { status: false, message, exam: null },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;

    const examId = Number(params.get("examId"));
    const cid = Number(params.get("cid"));

    if (
      !Number.isSafeInteger(examId) ||
      examId <= 0 ||
      !Number.isSafeInteger(cid) ||
      cid <= 0
    ) {
      return fail("Invalid exam ID or course ID.");
    }

    // Public metadata only. uid=0 is not an
    // authenticated user or entitlement.
    const result = await getMockTestDetails({
      uid: 0,
      cid,
      examId,
      type: "studyplan",
    });

    if (result?.status === false) {
      return fail(
        result?.message ||
          result?.msg ||
          "Unable to load mock test.",
        502
      );
    }

    const candidates = [
      result?.exam,
      result?.data,
      result?.details,
    ];

    let exam = null;

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        exam = candidate.find(
          (item) =>
            String(item?.id ?? item?.exam_id) ===
            String(examId)
        ) || candidate[0];

        if (exam) break;
      } else if (
        candidate &&
        typeof candidate === "object"
      ) {
        exam = candidate;
        break;
      }
    }

    if (!exam) {
      return fail("Mock test not found.", 404);
    }

    const returnedId = Number(
      exam?.id ?? exam?.exam_id ?? examId
    );

    if (returnedId !== examId) {
      return fail("Mock test ID mismatch.", 404);
    }

    const type = String(
      exam?.type || "studyplan"
    ).toLowerCase();

    if (type !== "studyplan") {
      return fail("Not a Study Plan mock test.", 404);
    }

    return NextResponse.json(
      {
        status: true,
        exam: {
          id: examId,
          exam_name:
            exam?.exam_name ||
            exam?.title ||
            `Study Plan Test ${examId}`,
          total_questions:
            Number(exam?.total_questions) || 0,
          total_minutes:
            Number(exam?.total_minutes) || 0,
          total_mark:
            Number(exam?.total_mark) || 0,
          access: String(
            exam?.access || "paid"
          ).toLowerCase(),
          type: "studyplan",
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error(
      "STUDYPLAN PREVIEW ERROR:",
      error
    );

    return fail(
      "Unable to load mock test preview.",
      502
    );
  }
}
