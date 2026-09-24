import { NextResponse } from "next/server";

const API_URL =
  "http://psc.technocitysolutions.com/public/api/getReelsList";

const API_KEY = process.env.PSC_API_KEY;

export async function POST(request) {
  try {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const uid = String(body?.uid ?? "0");

    const formData = new FormData();

    formData.append("api", API_KEY);
    formData.append("uid", uid);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `AI videos API failed with status ${response.status}`
      );
    }

    const result = await response.json();

    const videos = Array.isArray(result?.data)
      ? result.data
      : [];

    const thumbnailPath =
      result?.thumbnail_path || "";

    const normalizedVideos = videos
      .filter((video) => String(video?.status) === "1")
      .map((video) => ({
        id: video?.id,
        title: video?.title || "",
        description: video?.description || "",
        thumbnail: video?.thumbnail
          ? `${thumbnailPath}${video.thumbnail}`
          : "",
        videoUrl: video?.link || "",
        createdDate: video?.created_date || "",
      }));

    return NextResponse.json({
      success: true,
      videos: normalizedVideos,
    });
  } catch (error) {
    console.error("AI Videos API Error:", error);

    return NextResponse.json(
      {
        success: false,
        videos: [],
        message: "Unable to load AI videos.",
      },
      {
        status: 500,
      }
    );
  }
}