import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return reply(
      {
        status: false,
        message: "Invalid search request.",
        details: [],
      },
      400
    );
  }

  const keyword = String(body?.keyword || "").trim();

  if (keyword.length < 2 || keyword.length > 100) {
    return reply(
      {
        status: false,
        message: "Search keyword must be between 2 and 100 characters.",
        details: [],
      },
      400
    );
  }

  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    return reply(
      {
        status: false,
        message: "PSC API configuration is missing.",
        details: [],
      },
      500
    );
  }

  const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");
  const formData = new FormData();
  formData.append("api", apiKey);
  formData.append("keyword", keyword);

  try {
    const response = await fetch(`${baseUrl}/searchSuggestion`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    let result;

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error("Search suggestion API returned invalid JSON.");
      return reply(
        {
          status: false,
          message: "Search service returned an invalid response.",
          details: [],
        },
        502
      );
    }

    if (!response.ok) {
      return reply(
        {
          status: false,
          message: result?.message || "Unable to fetch search suggestions.",
          details: [],
        },
        response.status
      );
    }

    return reply(
      {
        ...result,
        details: Array.isArray(result?.details) ? result.details : [],
      },
      200
    );
  } catch (error) {
    console.error("Search suggestion API request failed:", error);
    return reply(
      {
        status: false,
        message: "Unable to fetch search suggestions.",
        details: [],
      },
      502
    );
  }
}
