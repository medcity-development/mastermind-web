import {
  NextResponse,
} from "next/server";

import {
  getMainCourses,
} from "@/lib/pscApi";

export async function GET() {
  try {
    const result =
      await getMainCourses();

    if (!result.status) {
      const status =
        result.httpStatus === 429
          ? 429
          : 503;
      const headers = {
        "Cache-Control": "no-store",
      };

      if (result.retryAfter > 0) {
        headers["Retry-After"] = String(
          result.retryAfter
        );
      }

      return NextResponse.json(
        {
          status: false,
          file_path: "",
          data: [],
          message:
            result.message ||
            "Unable to fetch main courses.",
        },
        {
          status,
          headers,
        }
      );
    }

    return NextResponse.json(
      {
        status:
          result.status,

        file_path:
          result.filePath,

        data:
          result.courses,

        message: "",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error(
      "Main courses API error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        file_path: "",
        data: [],

        message:
          error?.message ||
          "Unable to fetch main courses.",
      },
      {
        status: 500,
      }
    );
  }
}