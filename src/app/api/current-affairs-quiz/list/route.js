import { NextResponse } from "next/server";

const API_URL =
  "http://psc.technocitysolutions.com/public/api/getCurrentAffairQuizList";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const cid =
      searchParams.get("cid");

    const uid =
      searchParams.get("uid") || "0";

    if (!cid) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Month id is required.",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env.PSC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: false,
          message:
            "PSC_API_KEY is missing.",
          data: [],
        },
        {
          status: 500,
        }
      );
    }

    const formData =
      new FormData();

    formData.append(
      "api",
      apiKey
    );

    formData.append(
      "cid",
      String(cid)
    );

    formData.append(
      "uid",
      String(uid)
    );

    const response =
      await fetch(API_URL, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

    const rawText =
      await response.text();

    let result;

    try {
      result =
        JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message:
            "Quiz list API returned invalid data.",
          data: [],
        },
        {
          status: 502,
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            result?.message ||
            "Unable to fetch quiz list.",
          data: [],
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      {
        status: true,
        data:
          Array.isArray(
            result?.data
          )
            ? result.data
            : [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Quiz list route error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          "Failed to load quizzes.",
        data: [],
      },
      {
        status: 500,
      }
    );
  }
}