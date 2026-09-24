import {
  NextResponse,
} from "next/server";

import {
  getSubCategories,
} from "@/lib/pscApi";

/* =========================================================
   GET EXAM CATEGORIES

   /api/exam-category-section?cid=1&uid=0
   -> Kerala PSC

   /api/exam-category-section?cid=2&uid=0
   -> RRB & SSC
========================================================= */

export async function GET(
  request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

    const cidParam =
      searchParams.get(
        "cid"
      );

    const uidParam =
      searchParams.get(
        "uid"
      );

    if (
      cidParam === null ||
      cidParam === ""
    ) {
      return NextResponse.json(
        {
          status: false,
          file_path: "",
          data: [],
          message:
            "Course ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cid =
      Number(
        cidParam
      );

    const uid =
      Number(
        uidParam ?? 0
      );

    if (
      Number.isNaN(cid) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,
          file_path: "",
          data: [],
          message:
            "Invalid course ID.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getSubCategories({
        cid,

        uid:
          Number.isNaN(uid)
            ? 0
            : uid,
      });

    return NextResponse.json({
      status:
        result?.status ??
        false,

      file_path:
        result?.filePath ??
        "",

      data:
        Array.isArray(
          result?.categories
        )
          ? result.categories
          : [],

      message:
        result?.message ??
        "",
    });
  } catch (error) {
    console.error(
      "Exam category API error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        file_path: "",
        data: [],
        message:
          error?.message ||
          "Unable to fetch exam categories.",
      },
      {
        status: 500,
      }
    );
  }
}