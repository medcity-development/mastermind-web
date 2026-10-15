import { NextResponse } from "next/server";

import { getPreviousQuestions } from "@/lib/pyqHelper";

function getNumberParam(searchParams, key) {
  const value = searchParams.get(key);
  if (value === null || value === "") {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = getNumberParam(searchParams, "cid");

    if (!Number.isInteger(cid) || cid <= 0) {
      return NextResponse.json(
        {
          status: false,
          view: "",
          data: [],
          nextOffset: null,
          message: "Valid cid is required.",
        },
        { status: 400 }
      );
    }

    const result = await getPreviousQuestions({
      uid: 0,
      cid,
      offset: getNumberParam(searchParams, "offset"),
      type: searchParams.get("type") ?? undefined,
      filter: getNumberParam(searchParams, "filter"),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("public previous-questions route:", error);

    return NextResponse.json(
      {
        status: false,
        view: "",
        data: [],
        nextOffset: null,
        message: "Unable to load public previous questions.",
      },
      { status: 500 }
    );
  }
}
