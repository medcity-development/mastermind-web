import {
  NextResponse,
} from "next/server";

import {
  getAiVideos,
} from "@/lib/aiVideosHelper";

export async function POST(
  request
) {
  try {
    /* =====================================================
       READ BODY SAFELY

       Allows:
       - empty body
       - { uid: 21 }
       - guest uid = 0
    ===================================================== */

    let body = {};

    try {
      const text =
        await request.text();

      body = text
        ? JSON.parse(text)
        : {};
    } catch (error) {
      console.warn(
        "AI videos request body invalid or empty:",
        error
      );

      body = {};
    }

    /* =====================================================
       USER ID
    ===================================================== */

    const uid =
      Number(
        body?.uid ?? 0
      ) || 0;

    /* =====================================================
       FETCH AI VIDEOS
    ===================================================== */

    const result =
      await getAiVideos({
        uid,
      });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        status:
          result?.status ??
          false,

        data:
          result?.data ??
          [],

        videos:
          result?.data ??
          [],

        total:
          result?.total ??
          0,

        thumbnailPath:
          result?.thumbnailPath ??
          "",

        message:
          result?.message ??
          "",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "AI videos API:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        data: [],
        videos: [],
        total: 0,
        thumbnailPath: "",
        message:
          error?.message ||
          "Unable to load AI videos.",
      },
      {
        status: 500,
      }
    );
  }
}