import { NextResponse } from "next/server";
import {
  ENQUIRY_ADMIN_COOKIE,
  verifyEnquiryAdminSession,
} from "@/lib/enquiryAdminSession";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request) {
  const token = request.cookies.get(ENQUIRY_ADMIN_COOKIE)?.value;
  const isAdmin = await verifyEnquiryAdminSession(token);

  if (!isAdmin) {
    return reply(
      {
        status: false,
        message: "Sign in to view enquiries.",
      },
      401
    );
  }

  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    console.error("Enquiry API configuration is missing.");
    return reply(
      {
        status: false,
        message: "The enquiry service is temporarily unavailable.",
      },
      500
    );
  }

  const formData = new FormData();
  formData.append("api", apiKey);
  const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");

  try {
    const upstreamResponse = await fetch(`${baseUrl}/getEnquiry`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const responseText = await upstreamResponse.text();
    let result;

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error("getEnquiry API returned invalid JSON.");
      return reply(
        {
          status: false,
          message: "The enquiry service returned an invalid response.",
        },
        502
      );
    }

    if (!upstreamResponse.ok || result?.status !== true) {
      return reply(
        {
          status: false,
          message:
            result?.msg ||
            result?.message ||
            "Unable to load enquiries.",
        },
        upstreamResponse.ok ? 502 : upstreamResponse.status
      );
    }

    return reply({
      status: true,
      details: Array.isArray(result?.details) ? result.details : [],
    });
  } catch (error) {
    console.error("getEnquiry API request failed:", error);
    return reply(
      {
        status: false,
        message: "Unable to load enquiries. Please try again.",
      },
      502
    );
  }
}
