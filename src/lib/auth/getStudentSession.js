
import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.STUDENT_AUTH_SECRET;

  if (!secret) {
    throw new Error("STUDENT_AUTH_SECRET is missing.");
  }

  return new TextEncoder().encode(secret);
}

export async function getStudentSession() {
  const cookieStore = await cookies();

  const authToken = cookieStore.get(
    "student_auth_token"
  )?.value;

  if (!authToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      authToken,
      getSecret(),
      {
        algorithms: ["HS256"],
      }
    );

    const uid = String(payload?.uid ?? "").trim();

    if (!/^[1-9]\d*$/.test(uid)) {
      return null;
    }

    const email = String(payload?.email ?? "")
      .trim()
      .toLowerCase();

    const name = String(
      payload?.name ?? ""
    ).trim();

    const stage = String(
      payload?.stage ?? ""
    )
      .trim()
      .toLowerCase();

    return {
      authenticated: true,
      uid,
      email,
      name,
      stage,
      token: authToken,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Student session verification failed:",
        error?.message
      );
    }

    return null;
  }
}
