import {
    NextResponse,
  } from "next/server";
  
  import {
    getScertFolders,
  } from "@/lib/scertHelper";
  
  /* =========================================================
     SCERT FOLDERS API
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
  
      const uid =
        searchParams.get(
          "uid"
        ) || "0";
  
      const cid =
        searchParams.get(
          "cid"
        ) || "1";
  
      const offset =
        searchParams.get(
          "offset"
        ) || "0";
  
      const result =
        await getScertFolders({
          uid,
          cid,
          offset,
        });
  
      return NextResponse.json(
        {
          status:
            result?.status ??
            true,
  
          data:
            Array.isArray(
              result?.data
            )
              ? result.data
              : [],
  
          nextOffset:
            result?.nextOffset ??
            result?.nextoffset ??
            null,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(
        "SCERT folders API:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          data: [],
          nextOffset: null,
  
          message:
            error?.message ||
            "Unable to load SCERT folders.",
        },
        {
          status: 500,
        }
      );
    }
  }