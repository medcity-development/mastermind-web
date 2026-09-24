import {
  NextResponse,
} from "next/server";

import {
  getSubExams,
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

    const cid =
      searchParams.get(
        "cid"
      );

    const subId =
      searchParams.get(
        "subId"
      ) ??
      searchParams.get(
        "subid"
      ) ??
      searchParams.get(
        "sub_id"
      );

    const uid =
      searchParams.get(
        "uid"
      ) ?? "0";

    /* =====================================================
       CID REQUIRED
    ===================================================== */

    if (
      cid === null ||
      cid === ""
    ) {
      return NextResponse.json(
        {
          status: false,
          icon_path: "",
          data: [],
          message:
            "Course ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       SUB CATEGORY REQUIRED
    ===================================================== */

    if (
      subId === null ||
      subId === ""
    ) {
      return NextResponse.json(
        {
          status: false,
          icon_path: "",
          data: [],
          message:
            "Sub category ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FETCH SUB EXAMS
    ===================================================== */

    const result =
      await getSubExams({
        cid,
        uid,
        subId,
      });

    return NextResponse.json({
      status:
        result?.status ??
        false,

      icon_path:
        result?.iconPath ??
        "",

      data:
        Array.isArray(
          result?.exams
        )
          ? result.exams
          : [],

      message:
        result?.message ??
        "",
    });
  } catch (error) {
    console.error(
      "Sub exams API error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        icon_path: "",
        data: [],
        message:
          error?.message ||
          "Unable to fetch exams.",
      },
      {
        status: 500,
      }
    );
  }
}