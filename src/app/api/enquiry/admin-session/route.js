import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import {
  ENQUIRY_ADMIN_COOKIE,
  getEnquiryAdminSessionSecret,
} from "@/lib/enquiryAdminSession";

export const dynamic = "force-dynamic";

const sessionDurationSeconds = 60 * 60 * 12;

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
        message: "Invalid sign-in request.",
      },
      400
    );
  }

  const adminPassword = process.env.ENQUIRY_ADMIN_PASSWORD;

  try {
    getEnquiryAdminSessionSecret();
  } catch (error) {
    console.error("Enquiry admin session configuration error:", error);
    return reply(
      {
        status: false,
        message: "Admin sign-in is not configured.",
      },
      500
    );
  }

  if (!adminPassword) {
    console.error("ENQUIRY_ADMIN_PASSWORD is not configured.");
    return reply(
      {
        status: false,
        message: "Admin sign-in is not configured.",
      },
      500
    );
  }

  if (
    typeof body?.password !== "string" ||
    body.password !== adminPassword
  ) {
    return reply(
      {
        status: false,
        message: "Incorrect password.",
      },
      401
    );
  }

  const token = await new SignJWT({
    scope: "enquiry-admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("mastermind-web")
    .setAudience("enquiry-admin")
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getEnquiryAdminSessionSecret());

  const response = reply({
    status: true,
    message: "Signed in.",
  });

  response.cookies.set(ENQUIRY_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  });

  return response;
}

export async function DELETE() {
  const response = reply({
    status: true,
    message: "Signed out.",
  });

  response.cookies.set(ENQUIRY_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
