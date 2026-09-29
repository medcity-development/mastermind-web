// src/lib/auth/getStudentSession.js

import {
  cookies,
} from "next/headers";

import {
  jwtVerify,
} from "jose";

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

export async function getStudentSession() {
  const cookieStore =
    await cookies();

  const authToken =
    cookieStore.get(
      "student_auth_token"
    )?.value;

  if (!authToken) {
    return null;
  }

  try {
    const {
      payload,
    } =
      await jwtVerify(
        authToken,
        getSecret()
      );

    if (!payload?.uid) {
      return null;
    }

    return {
      authenticated:
        true,

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

      stage:
        String(
          payload.stage || ""
        ),

      token:
        authToken,
    };
  } catch (error) {
    console.error(
      "STUDENT SESSION ERROR:",
      error
    );

    return null;
  }
}