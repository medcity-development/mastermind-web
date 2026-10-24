import "server-only";

import { jwtVerify } from "jose";

export const ENQUIRY_ADMIN_COOKIE = "enquiry_admin_session";

export function getEnquiryAdminSessionSecret() {
  const secret = process.env.ENQUIRY_ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ENQUIRY_ADMIN_SESSION_SECRET must contain at least 32 characters."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function verifyEnquiryAdminSession(token) {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getEnquiryAdminSessionSecret(),
      {
        algorithms: ["HS256"],
        issuer: "mastermind-web",
        audience: "enquiry-admin",
      }
    );

    return payload?.scope === "enquiry-admin";
  } catch {
    return false;
  }
}
