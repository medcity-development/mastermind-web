import {
  NextResponse,
} from "next/server";

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

    const uid =
      searchParams.get(
        "uid"
      ) || "0";

    const examId =
      searchParams.get(
        "examid"
      );

    if (!cid) {
      return NextResponse.json(
        {
          status: false,

          message:
            "cid is required.",

          exam: [],

          data: [],
        },
        {
          status: 400,
        }
      );
    }

    if (!examId) {
      return NextResponse.json(
        {
          status: false,

          message:
            "examid is required.",

          exam: [],

          data: [],
        },
        {
          status: 400,
        }
      );
    }

    const apiBaseUrl =
      process.env
        .PSC_API_BASE_URL;

    const apiKey =
      process.env
        .PSC_API_KEY;

    if (
      !apiBaseUrl ||
      !apiKey
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "PSC API configuration is missing.",

          exam: [],

          data: [],
        },
        {
          status: 500,
        }
      );
    }

    const baseUrl =
      String(
        apiBaseUrl
      )
        .trim()
        .replace(
          /\/+$/,
          ""
        );

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
      "examid",
      String(examId)
    );

    formData.append(
      "type",
      "mock"
    );

    const response =
      await fetch(
        `${baseUrl}/getMockTestDetails`,
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",
        }
      );

    const text =
      await response.text();

    let result = {};

    try {
      result =
        text
          ? JSON.parse(
              text
            )
          : {};
    } catch {
      return NextResponse.json(
        {
          status: false,

          message:
            "Mock test details API returned invalid JSON.",

          exam: [],

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
            "Unable to fetch mock test details.",

          exam: [],

          data: [],
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Mock details route:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          "Failed to load mock test details.",

        exam: [],

        data: [],
      },
      {
        status: 500,
      }
    );
  }
}