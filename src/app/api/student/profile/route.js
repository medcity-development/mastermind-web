
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getStudentProfile,
  updateStudentProfile,
} from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

function fail(message, status = 400) {
  return NextResponse.json(
    {
      status: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function getSecret() {
  const secret = process.env.STUDENT_AUTH_SECRET;

  if (!secret) {
    throw new Error("STUDENT_AUTH_SECRET is missing.");
  }

  return new TextEncoder().encode(secret);
}

function validDob(value) {
  if (!value) return true;

  const match = value.match(
    /^(\d{2})-(\d{2})-(\d{4})$/
  );

  if (!match) return false;

  const [, day, month, year] = match;

  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    date.getTime() <= Date.now()
  );
}

async function createSessionToken({
  uid,
  email,
  name,
  stage,
}) {
  return new SignJWT({
    uid: String(uid),
    email,
    name,
    stage,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function GET(request) {
  try {
    const session = await getStudentSession();

    if (!session?.uid) {
      return fail("Please login again.", 401);
    }

    const { searchParams } = new URL(request.url);

    const cid = Number(
      searchParams.get("cid") || 1
    );

    if (!Number.isInteger(cid) || cid <= 0) {
      return fail("Invalid course ID.");
    }

    const result = await getStudentProfile({
      uid: session.uid,
      cid,
    });

    if (!result.status) {
      return fail(
        result.message || "Unable to fetch profile.",
        502
      );
    }

    if (
      result.profile?.id != null &&
      String(result.profile.id) !== String(session.uid)
    ) {
      return fail("Student profile ID mismatch.", 502);
    }

    const profileCompleted =
      result.profileCompleted === true;

    const stage = profileCompleted
      ? "completed"
      : "profileset";

    const response = NextResponse.json(
      {
        status: true,
        uid: String(session.uid),
        stage,
        profileCompleted,
        profile: result.profile,
        message: result.message,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Synchronize the JWT when Android has already
    // completed the student's profile.

    if (
      profileCompleted &&
      session.stage !== "completed"
    ) {
      const token = await createSessionToken({
        uid: session.uid,
        email: session.email,
        name:
          result.profile?.name ||
          session.name ||
          "",
        stage: "completed",
      });

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
    }

    return response;
  } catch (error) {
    console.error("GET STUDENT PROFILE ERROR:", error);

    return fail(
      "Unable to retrieve student profile.",
      500
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getStudentSession();

    if (!session?.uid || !session?.email) {
      return fail("Please login again.", 401);
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
      return fail("Full name is required.");
    }

    if (requestedEmail !== email) {
      return fail(
        "Changing your login email requires separate verification."
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return fail("Enter a valid 10-digit mobile number.");
    }

    if (!place) {
      return fail("District is required.");
    }

    if (!validDob(dob)) {
      return fail(
        "Enter a valid date of birth in DD-MM-YYYY format."
      );
    }

    const result = await updateStudentProfile({
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
        "Unable to update profile."
      );
    }

    // Confirm the saved state before marking
    // the authentication session as completed.

    const verified = await getStudentProfile({
      uid: session.uid,
      cid: 1,
    });

    if (!verified.status) {
      return fail(
        "Profile was updated, but verification failed.",
        502
      );
    }

    const completed =
      verified.profileCompleted === true;

    const stage = completed
      ? "completed"
      : "profileset";

    const token = await createSessionToken({
      uid: session.uid,
      email,
      name: verified.profile?.name || name,
      stage,
    });

    const response = NextResponse.json({
      status: true,
      message:
        result?.msg ||
        result?.message ||
        "Profile updated successfully.",
      stage,
      profileCompleted: completed,
      profile: verified.profile,
    });

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

    return response;
  } catch (error) {
    console.error("PATCH STUDENT PROFILE ERROR:", error);

    return fail(
      "Unable to update student profile.",
      500
    );
  }
}
