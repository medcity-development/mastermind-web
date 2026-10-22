import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";

export const dynamic = "force-dynamic";

const authCookies = [
  "student_auth_token",
  "mastermind_uid",
  "mastermind_email",
  "mastermind_stage",
  "mastermind_mobile",
];

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE() {
  try {
    const session = await getStudentSession();
    const uid = String(session?.uid || "").trim();

    if (!/^[1-9]\d*$/.test(uid)) {
      return reply(
        {
          status: false,
          message: "Please log in again before deleting your account.",
        },
        401
      );
    }

    const apiBaseUrl = process.env.PSC_API_BASE_URL;
    const apiKey = process.env.PSC_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      return reply(
        {
          status: false,
          message: "Account service configuration is missing.",
        },
        500
      );
    }

    const formData = new FormData();
    formData.append("api", apiKey);
    formData.append("uid", uid);

    const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");
    const upstreamResponse = await fetch(`${baseUrl}/deleteAccount`, {
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
      console.error("deleteAccount API returned invalid JSON.");
      return reply(
        {
          status: false,
          message: "Account service returned an invalid response.",
        },
        502
      );
    }

    if (!upstreamResponse.ok || result?.status !== true) {
      return reply(
        {
          status: false,
          message: result?.msg || result?.message || "Unable to delete your account.",
        },
        upstreamResponse.ok ? 502 : upstreamResponse.status
      );
    }

    const response = NextResponse.json(
      {
        status: true,
        message: result?.msg || "Profile deleted.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    for (const name of authCookies) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }

    return response;
  } catch (error) {
    console.error("DELETE /api/student/delete-account failed:", error);
    return reply(
      {
        status: false,
        message: "Unable to delete your account. Please try again.",
      },
      500
    );
  }
}
