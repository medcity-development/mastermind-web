
const BASE_URL = "https://mastermind.local";

const BLOCKED_PATHS = new Set([
  "/login",
  "/otp-verify",
  "/profile-setup",
]);

export function getPostLoginRedirectPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  ) {
    return "";
  }

  try {
    const url = new URL(value, BASE_URL);

    if (url.origin !== BASE_URL) {
      return "";
    }

    const pathname =
      url.pathname.replace(/\/+$/, "") || "/";

    if (BLOCKED_PATHS.has(pathname)) {
      return "";
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return "";
  }
}
