import {
  NextResponse,
} from "next/server";

import {
  getSubExamDetails,
} from "@/lib/subExamDetailsHelper";

/* =========================================================
   NORMALIZE ARRAY
========================================================= */

function getArrayFromResult(
  result
) {
  if (!result) {
    return [];
  }

  /*
   * Possible API/helper shapes:
   *
   * result.items
   * result.data
   * result.data.items
   * result.data.data
   * result.exams
   * result.list
   */

  if (
    Array.isArray(
      result?.items
    )
  ) {
    return result.items;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.data?.items
    )
  ) {
    return result.data.items;
  }

  if (
    Array.isArray(
      result?.data?.data
    )
  ) {
    return result.data.data;
  }

  if (
    Array.isArray(
      result?.exams
    )
  ) {
    return result.exams;
  }

  if (
    Array.isArray(
      result?.list
    )
  ) {
    return result.list;
  }

  return [];
}

/* =========================================================
   NORMALIZE ITEM
========================================================= */

function normalizeItem(
  item = {}
) {
  return {
    ...item,

    id:
      item?.id ??
      item?.subexamid ??
      item?.sub_exam_id ??
      null,

    sub_id:
      item?.sub_id ??
      item?.subid ??
      item?.subId ??
      null,

    exam:
      item?.exam ||
      item?.exam_name ||
      item?.name ||
      item?.title ||
      "Video Category",

    exam_name:
      item?.exam_name ||
      item?.exam ||
      item?.name ||
      item?.title ||
      "Video Category",
  };
}

/* =========================================================
   GET
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

    const uid =
      searchParams.get(
        "uid"
      ) || "0";

    const cid =
      searchParams.get(
        "cid"
      ) || "1";

    const examId =
      searchParams.get(
        "examId"
      );

    if (!examId) {
      return NextResponse.json(
        {
          status: false,
          data: null,
          items: [],
          message:
            "examId is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       GET TOPIC-WISE SOURCE
    ===================================================== */

    const result =
      await getSubExamDetails(
        {
          uid,
          cid,

          subExamId:
            examId,

          type:
            "topic",

          offset: 0,
        }
      );

    console.log(
      "RAW VIDEO SOURCE RESULT:",
      result
    );

    /* =====================================================
       FIND ARRAY
    ===================================================== */

    const rawItems =
      getArrayFromResult(
        result
      );

    console.log(
      "RAW VIDEO SOURCE ITEMS:",
      rawItems
    );

    /* =====================================================
       NORMALIZE
    ===================================================== */

    const items =
      rawItems
        .map(
          normalizeItem
        )
        .filter(
          (item) =>
            item?.id
        );

    console.log(
      "NORMALIZED VIDEO SOURCE ITEMS:",
      items
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        status:
          Boolean(
            result?.status
          ),

        data:
          result?.data ??
          null,

        items,

        message:
          result?.message ||
          "",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "sub-exam-video-source:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        data: null,
        items: [],
        message:
          error?.message ||
          "Unable to load video source.",
      },
      {
        status: 500,
      }
    );
  }
}