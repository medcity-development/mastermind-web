import {
    NextResponse,
  } from "next/server";
  
  import {
    getSubExamTopicList,
  } from "@/lib/subExamTopicHelper";
  
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
  
      const subId =
        searchParams.get(
          "subId"
        );
  
      const subExamId =
        searchParams.get(
          "subExamId"
        );
  
      if (!subId) {
        return NextResponse.json(
          {
            status: false,
            data: [],
            message:
              "subId is required.",
          },
          {
            status: 400,
          }
        );
      }
  
      if (!subExamId) {
        return NextResponse.json(
          {
            status: false,
            data: [],
            message:
              "subExamId is required.",
          },
          {
            status: 400,
          }
        );
      }
  
      const result =
        await getSubExamTopicList({
          uid,
          cid,
          subId,
          subExamId,
        });
  
      if (!result?.status) {
        return NextResponse.json(
          {
            status: false,
            data: [],
            message:
              result?.message ||
              "Unable to load topics.",
          },
          {
            status: 502,
          }
        );
      }
  
      return NextResponse.json({
        status: true,
  
        data:
          Array.isArray(
            result?.data
          )
            ? result.data
            : [],
      });
    } catch (error) {
      console.error(
        "SUB EXAM TOPICS:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          data: [],
          message:
            error?.message ||
            "Unable to load topics.",
        },
        {
          status: 500,
        }
      );
    }
  }