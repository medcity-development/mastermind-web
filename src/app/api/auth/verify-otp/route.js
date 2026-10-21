
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import {
  verifyLoginOtp,
} from "@/lib/auth/authApi";

import {
  getStudentProfile,
} from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

function getSecret() {
  const secret = process.env.STUDENT_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "STUDENT_AUTH_SECRET is missing."
    );
  }

  return new TextEncoder().encode(secret);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

// =====================================================
// NORMALIZE PROFILE STAGE
// =====================================================

function isProfileCompleted(profile) {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  return (
    String(profile.stage ?? "")
      .trim()
      .toLowerCase() === "completed"
  );
}

// =====================================================
// VERIFY OTP
// =====================================================

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const otp = String(body?.otp ?? "").trim();

    if (!email) {
      return NextResponse.json(
        {
          status: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(otp)) {
      return NextResponse.json(
        {
          status: false,
          message: "Enter a valid OTP.",
        },
        { status: 400 }
      );
    }

    // STEP 1: VERIFY OTP WITH BACKEND

    const result = await verifyLoginOtp({
      email,
      otp,
    });

    if (result?.status !== true) {
      return NextResponse.json(
        {
          status: false,
          message:
            result?.msg ||
            result?.message ||
            "OTP verification failed.",
        },
        { status: 400 }
      );
    }

    // STEP 2: GET VERIFIED USER ID

    const uid = String(
      result?.uid ??
      result?.data?.uid ??
      result?.data?.id ??
      ""
    ).trim();

    if (!/^[1-9]\d*$/.test(uid)) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Valid user ID was not returned after OTP verification.",
        },
        { status: 502 }
      );
    }

    // STEP 3: FETCH EXISTING PROFILE FROM BACKEND
    // This also supports students registered through
    // the Android application.

    let profileResult;

    try {
      profileResult = await getStudentProfile({
        uid,
        cid: 1,
      });
    } catch (error) {
      console.error(
        "PROFILE LOOKUP AFTER OTP FAILED:",
        error
      );

      return NextResponse.json(
        {
          status: false,
          message:
            "OTP verified, but your profile could not be checked. Please try again.",
        },
        { status: 502 }
      );
    }

    if (profileResult?.status !== true) {
      return NextResponse.json(
        {
          status: false,
          message:
            profileResult?.message ||
            "Unable to retrieve student profile.",
        },
        { status: 502 }
      );
    }

    const profile = profileResult?.profile ?? null;

    // STEP 4: VALIDATE PROFILE OWNERSHIP

    if (
      profile?.id != null &&
      String(profile.id) !== uid
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "Student profile ID mismatch.",
        },
        { status: 502 }
      );
    }

    // STEP 5: USE BACKEND PROFILE STAGE
    // Do not use the OTP stage as the authority.

    const profileCompleted =
      isProfileCompleted(profile);

    const stage = profileCompleted
      ? "completed"
      : "profileset";

    const name = String(
      profile?.name ||
      result?.name ||
      ""
    ).trim();

    // STEP 6: CREATE AUTHENTICATED SESSION

    const token = await new SignJWT({
      uid,
      email,
      name,
      stage,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getSecret());

    // STEP 7: RETURN PROFILE STATUS

    const response = NextResponse.json(
      {
        status: true,
        uid,
        email,
        name,
        stage,
        profileCompleted,
        profile,
        message: "OTP verified successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // STEP 8: UPDATE SESSION COOKIES

    response.cookies.set(
      "student_auth_token",
      token,
      cookieOptions
    );

    response.cookies.set(
      "mastermind_stage",
      stage,
      cookieOptions
    );

    response.cookies.set(
      "mastermind_email",
      email,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          "Unable to complete OTP verification.",
      },
      { status: 500 }
    );
  }
}
