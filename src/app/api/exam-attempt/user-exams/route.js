
import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserExamsList,
} from "@/lib/examAttemptHelper";

import {
  resolveExamHistoryName,
} from "@/lib/examHistoryHelper";

export const dynamic = "force-dynamic";

/* =========================================================
   EXTRACT HISTORY RECORDS
========================================================= */

function getDetails(result) {
  if (Array.isArray(result)) {
    return result;
  }

  const candidates = [
    result?.details,
    result?.data,
    result?.result,
    result?.results,
    result?.exams,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const nested = [
        candidate.details,
        candidate.data,
        candidate.result,
      ];

      for (const value of nested) {
        if (Array.isArray(value)) {
          return value;
        }
      }
    }
  }

  return [];
}

/* =========================================================
   VALID DISPLAY NAME
========================================================= */

function cleanName(value) {
  if (typeof value !== "string") {
    return "";
  }

  const name = value.trim();

  const invalidNames = [
    "",
    "null",
    "undefined",
    "unknown",
    "exam name unavailable",
    "n/a",
  ];

  if (invalidNames.includes(name.toLowerCase())) {
    return "";
  }

  return name;
}

/* =========================================================
   EXTRACT EXISTING NAME
========================================================= */

function getExistingName(item) {
  const candidates = [
    item?.exam_name,
    item?.examName,
    item?.exam_title,
    item?.examTitle,
    item?.test_name,
    item?.testName,
    item?.title,
    item?.name,
    item?.qpname,
    item?.qp_name,
    item?.question_paper_name,
    item?.exam?.exam_name,
    item?.exam?.title,
    item?.test?.title,
    item?.details?.exam_name,
  ];

  for (const value of candidates) {
    const name = cleanName(value);

    if (name) {
      return name;
    }
  }

  return "";
}

/* =========================================================
   EXTRACT EXAM ID

   Important:
   id often represents the saved attempt ID.
   exam_id represents the actual exam.
========================================================= */

function getExamId(item) {
  const candidates = [
    item?.exam_id,
    item?.examId,
    item?.test_id,
    item?.testId,
    item?.question_paper_id,
    item?.questionPaperId,
    item?.exam?.id,
  ];

  for (const value of candidates) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      String(value) !== "0"
    ) {
      return value;
    }
  }

  return null;
}

/* =========================================================
   NORMALIZE TYPE
========================================================= */

function getExamType(item, fallback = "") {
  const type = String(
    item?.exam_type ??
    item?.examType ??
    item?.type ??
    fallback
  )
    .trim()
    .toLowerCase();

  return type || fallback;
}

/* =========================================================
   RESOLVE NAME

   Existing backend name takes priority.

   Lookup failures must not hide history records.
========================================================= */

async function resolveName({
  item,
  uid,
  cid,
  examType,
  cache,
}) {
  const existingName = getExistingName(item);

  if (existingName) {
    return existingName;
  }

  const examId = getExamId(item);

  const type = getExamType(item, examType);

  if (!examId) {
    return "";
  }

  const key = `${cid}:${type}:${examId}`;

  if (!cache.has(key)) {
    const promise = Promise.resolve()
      .then(() =>
        resolveExamHistoryName({
          uid,
          cid,
          examId,
          examType: type,
          item,
        })
      )
      .then((result) => {
        if (typeof result === "string") {
          return cleanName(result);
        }

        if (result && typeof result === "object") {
          return getExistingName(result);
        }

        return "";
      })
      .catch((error) => {
        console.error(
          "EXAM NAME LOOKUP ERROR:",
          {
            examId,
            examType: type,
            message: error?.message,
          }
        );

        return "";
      });

    cache.set(key, promise);
  }

  return cache.get(key);
}

/* =========================================================
   POST /api/exam-attempt/user-exams
========================================================= */

export async function POST(request) {
  try {
    /* ================= SESSION ================= */

    const session = await getStudentSession();

    const uid = Number(session?.uid);

    if (!Number.isInteger(uid) || uid <= 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Please sign in to continue.",
          details: [],
        },
        { status: 401 }
      );
    }

    /* ================= BODY ================= */

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid JSON request.",
          details: [],
        },
        { status: 400 }
      );
    }

    const cid = Number(body?.cid);

    const examType = String(
      body?.exam_type ??
      body?.examType ??
      ""
    )
      .trim()
      .toLowerCase();

    if (!Number.isInteger(cid) || cid <= 0) {
      return NextResponse.json(
        {
          status: false,
          message: "Valid cid is required.",
          details: [],
        },
        { status: 400 }
      );
    }

    if (!examType) {
      return NextResponse.json(
        {
          status: false,
          message: "exam_type is required.",
          details: [],
        },
        { status: 400 }
      );
    }

    /* ================= FETCH HISTORY ================= */

    const result = await getUserExamsList({
      uid,
      cid,
      exam_type: examType,
    });

    const details = getDetails(result);

    if (
      [false, 0, "0", "false"].includes(result?.status) &&
      details.length === 0
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            result?.message ||
            result?.msg ||
            "Unable to load exam history.",
          exam_type: examType,
          details: [],
        },
        { status: 502 }
      );
    }

    if (!details.length) {
      return NextResponse.json({
        status: true,
        empty: true,
        exam_type: examType,
        details: [],
      });
    }

    /* ================= NAME LOOKUP ================= */

    const nameCache = new Map();

    const enrichedDetails = await Promise.all(
      details.map(async (item) => {
        const itemType = getExamType(item, examType);

        const name = await resolveName({
          item,
          uid,
          cid,
          examType: itemType,
          cache: nameCache,
        });

        const existingName = getExistingName(item);

        const finalName = name || existingName;

        return {
          ...item,

          exam_type: itemType,

          exam_name: finalName,

          _resolvedExamName: finalName,

          _examNameResolved: Boolean(finalName),
        };
      })
    );

    /* ================= DIAGNOSTICS ================= */

    const unresolved = enrichedDetails.filter(
      (item) => !item._examNameResolved
    );

    if (unresolved.length) {
      console.warn(
        "EXAM HISTORY: Names not resolved",
        unresolved.map((item) => ({
          attemptId:
            item?.id ??
            item?.pauseid ??
            item?.attempt_id,

          examId: getExamId(item),

          examType: item.exam_type,

          availableFields: Object.keys(item),
        }))
      );
    }

    /* ================= SUCCESS ================= */

    return NextResponse.json(
      {
        ...result,

        status: true,

        empty: false,

        exam_type: examType,

        details: enrichedDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "USER EXAMS ROUTE ERROR:",
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
      { status: 500 }
    );
  }
}
