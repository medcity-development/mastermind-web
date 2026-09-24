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
      ) ?? "0";

    const offset =
      searchParams.get(
        "offset"
      ) ?? "0";

    const filter =
      searchParams.get(
        "filter"
      ) ?? "0";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!cid) {
      return NextResponse.json(
        {
          status: false,

          message:
            "cid is required.",

          nextoffset:
            null,

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

          nextoffset:
            null,

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

    /* =====================================================
       FORM DATA
    ===================================================== */

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

    formData.append(
      "filter",
      String(filter)
    );

    /* =====================================================
       REQUEST
    ===================================================== */

    const response =
      await fetch(
        `${baseUrl}/getMockTestListbyOffset`,
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
      console.error(
        "Mock test list invalid JSON:",
        text
      );

      return NextResponse.json(
        {
          status: false,

          message:
            "Mock test API returned invalid JSON.",

          nextoffset:
            null,

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
            "Unable to load mock tests.",

          nextoffset:
            null,

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
        ...result,

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
      "Mock test list route:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          "Failed to load mock tests.",

        nextoffset:
          null,

        data: [],
      },
      {
        status: 500,
      }
    );
  }
}