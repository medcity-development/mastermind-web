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
    const url = new URL(
      value,
      "https://mastermind.local"
    );

    const pathname = url.pathname.replace(/\/$/, "");

    if (
      url.origin !== "https://mastermind.local" ||
      [
        "/login",
        "/otp-verify",
        "/profile-setup",
      ].includes(pathname)
    ) {
      return "";
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return "";
  }
}