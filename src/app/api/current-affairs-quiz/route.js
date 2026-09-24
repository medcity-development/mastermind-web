import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const cid =
      searchParams.get("cid") || "60";

    const uid =
      searchParams.get("uid") || "21";

    const formData =
      new FormData();

    formData.append(
      "api",
      process.env.PSC_API_KEY
    );

    formData.append(
      "cid",
      String(cid)
    );

    formData.append(
      "uid",
      String(uid)
    );

    const response = await fetch(
      "http://psc.technocitysolutions.com/public/api/getCurrentAffairQuizList",
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            result?.message ||
            "Failed to fetch current affairs quizzes.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(
      {
        status:
          result?.status ?? true,

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
      "Current affairs quiz API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while fetching current affairs quizzes.",
        data: [],
      },
      {
        status: 500,
      }
    );
  }
}