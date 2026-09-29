// src/proxy.js

import {
  NextResponse,
} from "next/server";

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

async function getSessionFromRequest(
  request
) {
  const token =
    request.cookies.get(
      "student_auth_token"
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const {
      payload,
    } =
      await jwtVerify(
        token,
        getSecret()
      );

    if (!payload?.uid) {
      return null;
    }

    return {
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
        )
          .trim()
          .toLowerCase(),
    };
  } catch {
    return null;
  }
}

export async function proxy(
  request
) {
  const {
    pathname,
    search,
  } =
    request.nextUrl;

  const session =
    await getSessionFromRequest(
      request
    );

  /* =========================================================
     DASHBOARD PROTECTION
  ========================================================= */

  if (
    pathname.startsWith(
      "/dashboard"
    )
  ) {
    /* NOT LOGGED IN */

    if (!session) {
      const loginUrl =
        new URL(
          "/login",
          request.url
        );

      loginUrl.searchParams.set(
        "redirect",
        `${pathname}${search}`
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    /* PROFILE NOT COMPLETED */

    if (
      session.stage !==
      "completed"
    ) {
      return NextResponse.redirect(
        new URL(
          "/profile-setup",
          request.url
        )
      );
    }
  }

  /* =========================================================
     PROFILE SETUP PROTECTION
  ========================================================= */

  if (
    pathname.startsWith(
      "/profile-setup"
    )
  ) {
    if (!session) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }

    /*
     * Optional:
     * If profile is already completed,
     * don't allow user to return here.
     */

    if (
      session.stage ===
      "completed"
    ) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/kerala-psc",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile-setup/:path*",
  ],
};