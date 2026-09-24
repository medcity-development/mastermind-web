import {
    NextResponse,
  } from "next/server";
  
  import {
    getCurrentAffairData,
  } from "@/lib/currentAffairsHelper";
  
  export async function GET(
    request
  ) {
    try {
      const {
        searchParams,
      } =
        new URL(
          request.url
        );
  
      const cid =
        Number(
          searchParams.get(
            "cid"
          )
        );
  
      const date =
        searchParams.get(
          "date"
        );
  
      if (
        !cid ||
        !date
      ) {
        return NextResponse.json(
          {
            status: false,
            message:
              "cid and date are required.",
          },
          {
            status: 400,
          }
        );
      }
  
      const result =
        await getCurrentAffairData(
          {
            uid: 0,
            cid,
            date,
          }
        );
  
      return NextResponse.json(
        {
          status: true,
          ...result,
        }
      );
    } catch (error) {
      console.error(
        "Current affair API route:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          data: [],
          filePath: "",
        },
        {
          status: 500,
        }
      );
    }
  }