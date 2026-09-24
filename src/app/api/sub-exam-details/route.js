import {
    NextResponse,
  } from "next/server";
  
  import {
    getSubExamDetails,
  } from "@/lib/subExamDetailsHelper";
  
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
  
      const examId =
        searchParams.get(
          "examId"
        );
  
      const type =
        searchParams.get(
          "type"
        ) || "mock";
  
      const offset =
        searchParams.get(
          "offset"
        ) || "0";
  
      /* =======================================================
         VALIDATION
      ======================================================= */
  
      if (!examId) {
        return NextResponse.json(
          {
            status: false,
            data: null,
            items: [],
            message:
              "examId is required.",
          },
          {
            status: 400,
          }
        );
      }
  
      /* =======================================================
         API
      ======================================================= */
  
      const result =
        await getSubExamDetails({
          uid,
          cid,
          subExamId:
            examId,
          type,
          offset,
        });
  
      return NextResponse.json(
        {
          status:
            Boolean(
              result?.status
            ),
  
          data:
            result?.data ||
            null,
  
          items:
            Array.isArray(
              result?.items
            )
              ? result.items
              : [],
  
          iconPath:
            result?.iconPath ||
            "",
  
          subjectPath:
            result?.subjectPath ||
            "",
  
          nextOffset:
            result?.nextOffset ??
            null,
  
          message:
            result?.message ||
            "",
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(
        "SUB EXAM DETAILS ROUTE:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          data: null,
          items: [],
  
          message:
            error?.message ||
            "Unable to load exam details.",
        },
        {
          status: 500,
        }
      );
    }
  }