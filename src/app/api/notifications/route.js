import {
  NextResponse,
} from "next/server";

import {
  getExamNotifications,
} from "@/lib/pscApi";

/* =========================================================
   GET NOTIFICATIONS

   /api/notifications?cid=1&offset=0
   -> Kerala PSC

   /api/notifications?cid=2&offset=0
   -> RRB & SSC
========================================================= */

export async function GET(
  request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

    const cidParam =
      searchParams.get(
        "cid"
      );

    const uidParam =
      searchParams.get(
        "uid"
      );

    const offsetParam =
      searchParams.get(
        "offset"
      );

    if (
      cidParam === null ||
      cidParam === ""
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "cid is required.",
          nextoffset: null,
          file_path: "",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    const cid =
      Number(cidParam);

    const uid =
      Number(
        uidParam ?? 0
      );

    const offset =
      Number(
        offsetParam ?? 0
      );

    if (
      Number.isNaN(cid) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Invalid cid.",
          nextoffset: null,
          file_path: "",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getExamNotifications({
        cid,

        uid:
          Number.isNaN(uid)
            ? 0
            : uid,

        offset:
          Number.isNaN(
            offset
          )
            ? 0
            : offset,
      });

    return NextResponse.json(
      {
        status:
          result?.status ??
          false,

        message:
          result?.message ??
          "",

        nextoffset:
          result?.nextOffset ??
          null,

        file_path:
          result?.filePath ??
          "",

        data:
          Array.isArray(
            result?.notifications
          )
            ? result.notifications
            : [],
      }
    );
  } catch (error) {
    console.error(
      "Notifications API error:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load notifications.",

        nextoffset:
          null,

        file_path:
          "",

        data:
          [],
      },
      {
        status: 500,
      }
    );
  }
}