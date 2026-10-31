
import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";

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

    const parts = pathname.split("/").filter(Boolean);
    if (["dashboard", "government-exams-coaching"].includes(parts[0]) && parts[1] && !getGovernmentExamConfig(parts[1])) return "";
    if (parts[0] === "government-exams-coaching" && parts[1]) {
      const [, course, section, ...rest] = parts;
      if (section && !["mock-tests", "previous-questions", "scert-tests", "topic-wise-exams", "statement-type-exams"].includes(section) && !section.endsWith("-level-exams")) {
        return url.pathname + url.search + url.hash;
      }
      // Resume/submit handoffs must retain their exact start route and query.
      if (rest.at(-1) === "start") {
        return `/dashboard/${parts.slice(1).join("/")}${url.search}${url.hash}`;
      }
      const examId = url.searchParams.get("examId") || (/^\d+$/.test(rest.at(-1) || "") ? rest.at(-1) : "");
      let destination = `/dashboard/${course}/${section || ""}`;
      if (section === "scert-tests" && url.searchParams.has("classId")) {
        destination += `/classes/${encodeURIComponent(url.searchParams.get("classId"))}`;
      } else if (section === "topic-wise-exams" || section === "statement-type-exams") {
        destination += rest.length > 1 ? `/${rest.slice(0, -1).join("/")}` : "";
      } else if (!["mock-tests", "previous-questions", "scert-tests"].includes(section)) {
        destination += rest.length ? `/${rest.join("/")}` : "";
      }
      const selected = new URLSearchParams();
      if (examId) selected.set("selectedTestId", examId);
      const title = url.searchParams.get("selectedTestTitle");
      if (title) selected.set("selectedTestTitle", title);
      return destination + (selected.size ? `?${selected}` : "") + url.hash;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return "";
  }
}
