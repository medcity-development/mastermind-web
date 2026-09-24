import {
    NextResponse,
  } from "next/server";
  
  import {
    getPreviousQuestions,
  } from "@/lib/pyqHelper";
  
  function getNumberParam(
    searchParams,
    key
  ) {
    const value =
      searchParams.get(key);
  
    if (
      value === null ||
      value === ""
    ) {
      return undefined;
    }
  
    const number =
      Number(value);
  
    return Number.isNaN(number)
      ? undefined
      : number;
  }
  
  export async function GET(request) {
    try {
      const { searchParams } =
        new URL(request.url);
  
      const uid =
        getNumberParam(
          searchParams,
          "uid"
        );
  
      const cid =
        getNumberParam(
          searchParams,
          "cid"
        );
  
      const offset =
        getNumberParam(
          searchParams,
          "offset"
        );
  
      const filter =
        getNumberParam(
          searchParams,
          "filter"
        );
  
      const type =
        searchParams.get(
          "type"
        ) ?? undefined;
  
      const result =
        await getPreviousQuestions({
          uid,
          cid,
          offset,
          type,
          filter,
        });
  
      return NextResponse.json(
        result
      );
    } catch (error) {
      console.error(
        "previous-questions route:",
        error
      );
  
      return NextResponse.json(
        {
          status: false,
          view: "",
          data: [],
          nextOffset: null,
        },
        {
          status: 500,
        }
      );
    }
  }