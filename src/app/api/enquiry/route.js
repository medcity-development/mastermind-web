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
        message: "Invalid enquiry details.",
      },
      400
    );
  }

  const enquiry = {
    firstname: String(body?.firstname || "").trim(),
    message: String(body?.message || "").trim(),
    course: String(body?.course || "").trim(),
    email: String(body?.email || "").trim(),
    mobile: String(body?.mobile || "").trim(),
    address: String(body?.address || "").trim(),
  };

  if (Object.values(enquiry).some((value) => !value)) {
    return reply(
      {
        status: false,
        message: "Please complete all enquiry fields.",
      },
      400
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    return reply(
      {
        status: false,
        message: "Please enter a valid email address.",
      },
      400
    );
  }

  if (
    enquiry.firstname.length > 150 ||
    enquiry.message.length > 2000 ||
    enquiry.course.length > 150 ||
    enquiry.email.length > 254 ||
    enquiry.mobile.length > 30 ||
    enquiry.address.length > 500
  ) {
    return reply(
      {
        status: false,
        message: "One or more enquiry fields are too long.",
      },
      400
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

  for (const [field, value] of Object.entries(enquiry)) {
    formData.append(field, value);
  }

  const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");

  try {
    const upstreamResponse = await fetch(`${baseUrl}/AddEnquiry`, {
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
      console.error("AddEnquiry API returned invalid JSON.");
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
            "Unable to submit your enquiry. Please try again.",
        },
        upstreamResponse.ok ? 502 : upstreamResponse.status
      );
    }

    return reply({
      status: true,
      message: result?.msg || "Your enquiry has been submitted successfully.",
    });
  } catch (error) {
    console.error("AddEnquiry API request failed:", error);
    return reply(
      {
        status: false,
        message: "Unable to submit your enquiry. Please try again.",
      },
      502
    );
  }
}
