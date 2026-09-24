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
    const body =
      await request.json();

    const uid =
      Number(
        body?.uid ?? 0
      );

    const result =
      await getAiVideos({
        uid,
      });

    return NextResponse.json({
      status:
        result.status,

      data:
        result.data,

      videos:
        result.data,

      total:
        result.total,

      thumbnailPath:
        result.thumbnailPath,

      message:
        result.message,
    });
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
        message:
          "Unable to load AI videos.",
      },
      {
        status: 500,
      }
    );
  }
}