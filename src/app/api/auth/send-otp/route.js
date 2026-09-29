// src/app/api/auth/send-otp/route.js

import {
  NextResponse,
} from "next/server";

import {
  sendLoginOtp,
} from "@/lib/auth/authApi";

export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    const email =
      String(
        body?.email ?? ""
      )
        .trim()
        .toLowerCase();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!email) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       SEND OTP
    ===================================================== */

    const result =
      await sendLoginOtp({
        email,
      });

    console.log(
      "SEND OTP BACKEND RESULT:",
      result
    );

    /* =====================================================
       BACKEND FAILURE
    ===================================================== */

    if (
      result?.status !==
      true
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            result?.msg ||
            result?.message ||
            "Unable to send OTP.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        status: true,

        stage:
          result?.stage ||
          "",

        email:
          result?.email ||
          email,

        message:
          result?.msg ||
          "OTP sent successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "SEND OTP ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to send OTP.",
      },
      {
        status: 500,
      }
    );
  }
}