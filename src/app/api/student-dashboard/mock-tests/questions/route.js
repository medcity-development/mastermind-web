import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

export const dynamic =
  "force-dynamic";

/* =========================================================
   CLEAN BASE URL
========================================================= */

function cleanBaseUrl(
  value = ""
) {
  return String(value)
    .trim()
    .replace(/\/+$/, "");
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request
) {
  try {
    /* =====================================================
       SESSION

       UID is NOT accepted from browser.
       Always use logged-in student's uid.
    ===================================================== */

    const session =
      await getStudentSession();

    const uid =
      Number(
        session?.uid
      );

    if (
      !Number.isFinite(uid) ||
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
       QUERY PARAMS
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
        ) ??
        searchParams.get(
          "examId"
        )
      );

    const examType =
      String(
        searchParams.get(
          "examtype"
        ) ??
        searchParams.get(
          "examType"
        ) ??
        ""
      )
        .trim()
        .toLowerCase();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !Number.isFinite(cid) ||
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

    if (!examType) {
      return NextResponse.json(
        {
          status: false,

          message:
            "examtype is required.",

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
      cleanBaseUrl(
        process.env
          .PSC_API_BASE_URL
      );

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

    /* =====================================================
       FORM DATA

       Your getMockTestQuestions Postman request uses:

       api
       cid
       uid
       examid
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
      String(examId)
    );

    /*
     * Keep examtype available because
     * your dashboard is dynamic.
     *
     * If backend ignores it for mock,
     * that is harmless.
     */
    formData.append(
      "examtype",
      examType
    );

    /* =====================================================
       REQUEST
    ===================================================== */

    const response =
      await fetch(
        `${apiBaseUrl}/getMockTestQuestions`,
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",
        }
      );

    const rawText =
      await response.text();

    /* =====================================================
       JSON PARSE
    ===================================================== */

    let result;

    try {
      result =
        rawText
          ? JSON.parse(
              rawText
            )
          : {};
    } catch {
      console.error(
        "getMockTestQuestions RAW RESPONSE:",
        rawText
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

    /* =====================================================
       UPSTREAM ERROR
    ===================================================== */

    if (!response.ok) {
      return NextResponse.json(
        {
          ...result,

          status: false,

          message:
            result?.message ||
            result?.msg ||
            "Unable to load exam questions.",

          data:
            Array.isArray(
              result?.data
            )
              ? result.data
              : [],
        },
        {
          status:
            response.status,
        }
      );
    }

    /* =====================================================
       NORMALIZE
    ===================================================== */

    const questions =
      Array.isArray(
        result?.data
      )
        ? result.data
        : [];

    return NextResponse.json(
      {
        ...result,

        status:
          result?.status !==
          false,

        data:
          questions,
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
          "Unable to load exam questions.",

        data: [],
      },
      {
        status: 500,
      }
    );
  }
}