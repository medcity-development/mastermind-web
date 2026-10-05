import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

export const dynamic =
  "force-dynamic";

export async function GET(
  request
) {
  try {
    /* =====================================================
       SESSION
    ===================================================== */

    const session =
      await getStudentSession();

    const uid =
      Number(
        session?.uid
      );

    if (
      !Number.isFinite(
        uid
      ) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Please sign in to continue.",

          data: [],
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       QUERY
    ===================================================== */

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const cid =
      Number(
        searchParams.get(
          "cid"
        )
      );

    const examId =
      Number(
        searchParams.get(
          "examid"
        )
      );

    const examType =
      String(
        searchParams.get(
          "examtype"
        ) ?? ""
      )
        .trim()
        .toLowerCase();

    if (
      !Number.isFinite(
        cid
      ) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Valid cid is required.",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        examId
      ) ||
      examId <= 0
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Valid examid is required.",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       ENV
    ===================================================== */

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
      "examid",
      String(
        examId
      )
    );

    /*
     * Include only when
     * available.
     */
    if (examType) {
      formData.append(
        "examtype",
        examType
      );
    }

    /* =====================================================
       API
    ===================================================== */

    const response =
      await fetch(
        `${baseUrl}/getMockTestQuestions`,
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",
        }
      );

    const raw =
      await response.text();

    let result;

    try {
      result =
        raw
          ? JSON.parse(
              raw
            )
          : {};
    } catch {
      console.error(
        "getMockTestQuestions RAW:",
        raw
      );

      return NextResponse.json(
        {
          status: false,

          message:
            "Questions API returned invalid JSON.",

          data: [],
        },
        {
          status: 502,
        }
      );
    }

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            result?.message ||
            result?.msg ||
            "Unable to load questions.",

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
      "STUDENT MOCK QUESTIONS:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load questions.",

        data: [],
      },
      {
        status: 500,
      }
    );
  }
}