// src/app/api/auth/verify-otp/route.js

import {
  NextResponse,
} from "next/server";

import {
  SignJWT,
} from "jose";

import {
  verifyLoginOtp,
} from "@/lib/auth/authApi";

const AUTH_SECRET =
  process.env.STUDENT_AUTH_SECRET;

function getSecret() {
  if (!AUTH_SECRET) {
    throw new Error(
      "STUDENT_AUTH_SECRET is missing."
    );
  }

  return new TextEncoder().encode(
    AUTH_SECRET
  );
}

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

    const otp =
      String(
        body?.otp ?? ""
      ).trim();

    /* =========================================================
       VALIDATION
    ========================================================= */

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

    if (!otp) {
      return NextResponse.json(
        {
          status: false,
          message:
            "OTP is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       VERIFY OTP
    ========================================================= */

    const result =
      await verifyLoginOtp({
        email,
        otp,
      });

    console.log(
      "VERIFY OTP BACKEND RESULT:",
      result
    );

    if (
      result?.status !== true
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            result?.msg ||
            result?.message ||
            "OTP verification failed.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       NORMALIZE USER DATA
    ========================================================= */

    const uid =
      String(
        result?.uid ?? ""
      ).trim();

    const stage =
      String(
        result?.stage ?? ""
      )
        .trim()
        .toLowerCase();

    const name =
      String(
        result?.name ?? ""
      ).trim();

    if (!uid) {
      return NextResponse.json(
        {
          status: false,
          message:
            "User ID was not returned after OTP verification.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       CREATE SIGNED SESSION TOKEN
    ========================================================= */

    const authToken =
      await new SignJWT({
        uid,
        email,
        name,
        stage,
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime(
          "30d"
        )
        .sign(
          getSecret()
        );

    /* =========================================================
       CREATE RESPONSE
    ========================================================= */

    const response =
      NextResponse.json(
        {
          status: true,

          uid,
          email,
          name,
          stage,

          message:
            result?.msg ||
            result?.message ||
            "OTP verified successfully.",
        },
        {
          status: 200,
        }
      );

    /* =========================================================
       SAVE SESSION COOKIE
    ========================================================= */

    response.cookies.set(
      "student_auth_token",
      authToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",

        maxAge:
          60 *
          60 *
          24 *
          30,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "VERIFY OTP ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "OTP verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}