import {
  NextResponse,
} from "next/server";

import {
  getScertTestsPage,
} from "@/lib/scertHelper";

export async function GET(
  request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

    const uid =
      searchParams.get(
        "uid"
      ) || "0";

    const classId =
      searchParams.get(
        "classId"
      ) ||
      searchParams.get(
        "folderId"
      );

    const filter =
      searchParams.get(
        "filter"
      ) || "0";

    const offset =
      searchParams.get(
        "offset"
      ) || "0";

    if (!classId) {
      return NextResponse.json(
        {
          status: false,
          view: "",
          data: [],
          nextOffset: null,
          message:
            "SCERT class id is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getScertTestsPage({
        uid,

        classId,

        filter,

        offset,
      });

    return NextResponse.json(
      result,
      {
        status:
          result?.status
            ? 200
            : 502,
      }
    );
  } catch (error) {
    console.error(
      "SCERT LIST ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        view: "",
        data: [],
        nextOffset: null,
        message:
          error?.message ||
          "Unable to load SCERT tests.",
      },
      {
        status: 500,
      }
    );
  }
}