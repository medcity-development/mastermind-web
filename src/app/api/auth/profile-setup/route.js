// src/app/api/auth/profile-setup/route.js

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SignJWT,
  jwtVerify,
} from "jose";

import { setUserProfile } from "@/lib/auth/authApi";

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

export async function POST(request) {
  try {
    const cookieStore = await cookies();

    const authToken =
      cookieStore.get(
        "student_auth_token"
      )?.value;

    let session = null;

    if (authToken) {
      try {
        const { payload } =
          await jwtVerify(
            authToken,
            getSecret()
          );

        if (payload?.uid) {
          session = {
            uid:
              String(
                payload.uid
              ),

            email:
              String(
                payload.email || ""
              ),

            name:
              String(
                payload.name || ""
              ),
          };
        }
      } catch {
        session = null;
      }
    }

    /* =========================================================
       USER MUST BE AUTHENTICATED
    ========================================================= */

    if (!session?.uid || !session?.email) {
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
      session.email
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
        uid: session.uid,
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

          uid: session.uid,

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

    const updatedAuthToken =
      await new SignJWT({
        uid: session.uid,
        email,
        name,
        stage: "completed",
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

    response.cookies.set(
      "student_auth_token",
      updatedAuthToken,
      cookieOptions
    );

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
