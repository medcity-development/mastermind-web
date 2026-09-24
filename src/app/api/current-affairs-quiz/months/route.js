import { NextResponse } from "next/server";

const API_URL =
  "http://psc.technocitysolutions.com/public/api/getCurrentAffairMonthsCid";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const cid =
      searchParams.get("cid") || "1";

    const uid =
      searchParams.get("uid") || "0";

    const offset =
      searchParams.get("offset") || "10";

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

    formData.append(
      "offset",
      String(offset)
    );

    const response =
      await fetch(API_URL, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

    const text =
      await response.text();

    let result;

    try {
      result =
        JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message:
            "Months API returned invalid data.",
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
            "Unable to load months.",
          data: [],
        },
        {
          status:
            response.status,
        }
      );
    }

    const months =
      Array.isArray(
        result?.months
      )
        ? result.months
        : [];

    /*
      Only use month.quiz to determine
      whether this month HAS quizzes.

      Do not use it as the final count.
    */
    const availableMonths =
      months.filter(
        (item) =>
          Number(
            item?.quiz || 0
          ) > 0
      );

    return NextResponse.json(
      {
        status: true,
        data:
          availableMonths,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Month route error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          "Failed to load months.",
        data: [],
      },
      {
        status: 500,
      }
    );
  }
}