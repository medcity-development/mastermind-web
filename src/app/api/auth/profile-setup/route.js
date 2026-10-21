
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  setUserProfile,
} from "@/lib/auth/authApi";

import {
  getStudentProfile,
} from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

function getSecret() {
  const secret = process.env.STUDENT_AUTH_SECRET;

  if (!secret) {
    throw new Error("STUDENT_AUTH_SECRET is missing.");
  }

  return new TextEncoder().encode(secret);
}

function fail(message, status = 400) {
  return NextResponse.json(
    {
      status: false,
      message,
    },
    { status }
  );
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(request) {
  try {
    const session = await getStudentSession();

    if (!session?.uid || !session?.email) {
      return fail(
        "Your login session is missing or expired. Please login again.",
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.");
    }

    const name = String(body?.name ?? "").trim();

    const email = String(session.email)
      .trim()
      .toLowerCase();

    const requestedEmail = String(
      body?.email ?? email
    )
      .trim()
      .toLowerCase();

    const mobile = String(body?.mobile ?? "")
      .replace(/\D/g, "");

    const dob = String(body?.dob ?? "").trim();
    const place = String(body?.place ?? "").trim();

    const promocode = String(
      body?.promocode ?? ""
    ).trim();

    const code = String(
      body?.code ?? "+91"
    ).trim();

    const avatar = String(
      body?.avatar ?? ""
    ).trim();

    if (!name) {
      return fail("Name is required.");
    }

    if (!email || requestedEmail !== email) {
      return fail(
        "Please use your verified login email."
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return fail(
        "Enter a valid 10-digit mobile number."
      );
    }

    if (!place) {
      return fail("District is required.");
    }

    const result = await setUserProfile({
      uid: session.uid,
      name,
      email,
      mobile,
      dob,
      place,
      promocode,
      code,
      avatar,
    });

    if (result?.status !== true) {
      return fail(
        result?.msg ||
        result?.message ||
        "Unable to save profile."
      );
    }

    // Re-fetch from the shared mobile/web backend.

    const verified = await getStudentProfile({
      uid: session.uid,
      cid: 1,
    });

    if (!verified.status) {
      return fail(
        "Profile saved, but verification failed.",
        502
      );
    }

    if (verified.profileCompleted !== true) {
      return fail(
        "Profile saved, but the backend has not marked it completed.",
        409
      );
    }

    const verifiedProfile = verified.profile;

    const verifiedName = String(
      verifiedProfile?.name || name
    ).trim();

    const token = await new SignJWT({
      uid: String(session.uid),
      email,
      name: verifiedName,
      stage: "completed",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getSecret());

    const response = NextResponse.json(
      {
        status: true,
        uid: String(session.uid),
        email,
        name: verifiedName,
        stage: "completed",
        profileCompleted: true,
        profile: verifiedProfile,
        message:
          "Profile completed successfully.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set(
      "student_auth_token",
      token,
      cookieOptions
    );

    response.cookies.set(
      "mastermind_stage",
      "completed",
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
      "PROFILE SETUP ERROR:",
      error
    );

    return fail(
      "Unable to complete profile setup.",
      500
    );
  }
}
