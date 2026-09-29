// src/app/api/auth/profile-setup/route.js

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { setUserProfile } from "@/lib/auth/authApi";

export async function POST(request) {
  try {
    const cookieStore = await cookies();

    const cookieUid =
      cookieStore.get("mastermind_uid")?.value || "";

    const cookieEmail =
      cookieStore.get("mastermind_email")?.value || "";

    /* =========================================================
       USER MUST BE AUTHENTICATED
    ========================================================= */

    if (!cookieUid || !cookieEmail) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Your login session is missing or expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const name = String(
      body?.name ?? ""
    ).trim();

    const email = String(
      body?.email ??
      cookieEmail
    )
      .trim()
      .toLowerCase();

    const mobile = String(
      body?.mobile ?? ""
    )
      .replace(/\D/g, "")
      .trim();

    const dob = String(
      body?.dob ?? ""
    ).trim();

    const place = String(
      body?.place ?? ""
    ).trim();

    const promocode = String(
      body?.promocode ?? ""
    ).trim();

    const code = String(
      body?.code ?? "+91"
    ).trim();

    const avatar = String(
      body?.avatar ?? ""
    ).trim();

    /* =========================================================
       VALIDATION
    ========================================================= */

    if (!name) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    /* =========================================================
       SAVE PROFILE
    ========================================================= */

    const result =
      await setUserProfile({
        name,
        email,
        mobile,
        dob,
        place,
        promocode,
        code,
        uid: cookieUid,
        avatar,
      });

    console.log(
      "SET PROFILE BACKEND RESULT:",
      result
    );

    /* =========================================================
       PROFILE SAVE FAILED
    ========================================================= */

    if (
      result?.status !== true
    ) {
      return NextResponse.json(
        {
          ...result,

          status: false,

          message:
            result?.msg ||
            result?.message ||
            "Unable to save profile.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       SUCCESS RESPONSE
    ========================================================= */

    const response =
      NextResponse.json(
        {
          ...result,

          status: true,

          uid: cookieUid,

          message:
            result?.msg ||
            result?.message ||
            "Profile saved successfully.",
        },
        {
          status: 200,
        }
      );

    /* =========================================================
       COMMON COOKIE OPTIONS
    ========================================================= */

    const cookieOptions = {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        60 * 60 * 24 * 30,
    };

    /* =========================================================
       PROFILE IS NOW COMPLETED
    ========================================================= */

    response.cookies.set(
      "mastermind_stage",
      "completed",
      cookieOptions
    );

    /*
     * Keep email synchronized in case the
     * profile form allows the user to change it.
     */

    response.cookies.set(
      "mastermind_email",
      email,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error(
      "PROFILE SETUP ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to save profile.",
      },
      {
        status: 500,
      }
    );
  }
}