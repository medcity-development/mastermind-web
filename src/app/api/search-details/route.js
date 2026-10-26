import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";
import { getPyqExamDetails } from "@/lib/pyqDetailsHelper";
import { getMockTestDetails } from "@/lib/pscApi";
import { getTopicWiseExamDetails } from "@/lib/topicWiseExamHelper";
import { getScertExamDetails } from "@/lib/scertHelper";

export const dynamic = "force-dynamic";

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
    const uid = Number(session?.uid);

    if (
      !Number.isSafeInteger(uid) ||
      uid <= 0 ||
      session?.stage !== "completed"
    ) {
      return reply(
        { status: false, message: "Please sign in to view exam details." },
        401
      );
    }

    const { searchParams } = new URL(request.url);
    const governmentExamsSlug = String(
      searchParams.get("governmentExamsSlug") || ""
    );
    const config = getGovernmentExamConfig(governmentExamsSlug);
    const examId = Number(searchParams.get("examId"));
    const type = String(searchParams.get("type") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

    if (
      !config ||
      !Number.isSafeInteger(examId) ||
      examId <= 0
    ) {
      return reply(
        { status: false, message: "A valid exam must be selected." },
        400
      );
    }

    let result;

    if (type.includes("pqp") || type.includes("pyq") || type.includes("previousquestion")) {
      result = await getPyqExamDetails({
        uid,
        cid: config.cid,
        examId,
        type: "pqp",
      });
    } else if (type.includes("mock") || type.includes("studyplan")) {
      result = await getMockTestDetails({
        uid,
        cid: config.cid,
        examId,
        type: type.includes("studyplan") ? "studyplan" : "mock",
      });
    } else if (type.includes("twe") || type.includes("topicwise")) {
      result = await getTopicWiseExamDetails({
        uid,
        cid: config.cid,
        examId,
        type: "twe",
      });
    } else if (type.includes("scert")) {
      result = await getScertExamDetails({
        uid,
        cid: 1,
        examId,
        offset: 0,
      });
    } else {
      return reply(
        { status: false, message: "Details are not available for this result type." },
        400
      );
    }

    const exam = Array.isArray(result?.exam)
      ? result.exam[0] ?? null
      : result?.exam ?? null;

    if (result?.status === false || !exam) {
      return reply(
        {
          status: false,
          message: result?.message || "Unable to load details for this exam.",
        },
        502
      );
    }

    return reply({
      status: true,
      exam,
      instructions: Array.isArray(result?.instructions)
        ? result.instructions
        : [],
      examType: type,
    });
  } catch (error) {
    console.error("GET /api/search-details failed:", error);
    return reply(
      { status: false, message: "Unable to load exam details." },
      500
    );
  }
}
