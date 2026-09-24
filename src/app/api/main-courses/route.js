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