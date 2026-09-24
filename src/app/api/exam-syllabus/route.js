import {
  NextResponse,
} from "next/server";

import {
  getExamSyllabus,
} from "@/lib/pscApi";

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
            "cid is required.",
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
            "Invalid cid.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getExamSyllabus({
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
          result?.syllabus
        )
          ? result.syllabus
          : [],

      message:
        result?.message ??
        "",
    });
  } catch (error) {
    console.error(
      "Exam syllabus API error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        file_path: "",
        data: [],
        message:
          error?.message ||
          "Unable to fetch exam syllabus.",
      },
      {
        status: 500,
      }
    );
  }
}