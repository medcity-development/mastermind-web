import "server-only";

import { executePscRequest, setPscRateLimit } from "@/lib/pscRequestManager";

async function requestExam(endpoint, fields) {
  const base = String(process.env.PSC_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const api = String(process.env.PSC_API_KEY || "").trim();
  if (!base || !api) throw new Error("PSC API configuration is missing.");
  const body = new FormData();
  body.append("api", api);
  for (const [key, value] of Object.entries(fields)) body.append(key, String(value));

  const response = await executePscRequest({
    key: JSON.stringify({ base, endpoint, fields }),
    task: () => fetch(`${base}/${endpoint}`, {
      method: "POST", body, cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    }),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw Object.assign(new Error("Invalid exam response."), { httpStatus: response.ok ? 502 : response.status });
  }
  const message = String(result?.message ?? result?.msg ?? "");
  if (result?.rateLimited === true || Number(result?.status) === 429 ||
      Number(result?.httpStatus) === 429 || Number(result?.code) === 429 ||
      /too many attempts|too many requests|rate[\s-]?limit/i.test(message)) {
    const retryAfter = setPscRateLimit(response.headers.get("Retry-After") ?? result?.retryAfter ?? result?.retry_after);
    throw Object.assign(new Error("Exam service is temporarily rate-limited."), { httpStatus: 429, retryAfter });
  }
  if (!response.ok) throw Object.assign(new Error(message || "Unable to load exam."), { httpStatus: response.status });
  if (!result || ["false", "0", "failed", "failure", "error"].includes(String(result.status).toLowerCase())) {
    throw Object.assign(new Error(message || "Exam service rejected the request."), { httpStatus: 502 });
  }
  return result;
}

function failure(error) {
  const httpStatus = error?.httpStatus || (error?.name === "TimeoutError" ? 504 : 503);
  return {
    status: false, httpStatus, rateLimited: httpStatus === 429,
    retryAfter: error?.retryAfter ?? null,
    message: error?.message || "Unable to load exam.",
  };
}

export async function getPyqExamDetails({ uid = 0, cid = 1, examId, type = "pqp" } = {}) {
  const empty = { view: "", exam: null, instructions: [], paused: [] };
  if (!examId) return { ...empty, status: false, httpStatus: 400 };
  try {
    const result = await requestExam("getMockTestDetails", { uid, cid, examid: examId, type });
    const rawExam = Array.isArray(result.exam) ? result.exam[0] : result.exam;
    const exam = rawExam && typeof rawExam === "object" && !Array.isArray(rawExam) && Object.keys(rawExam).length
      ? rawExam : null;
    return {
      status: true, httpStatus: 200, view: result.view ?? "", exam,
      instructions: Array.isArray(result.data) ? result.data : [],
      paused: Array.isArray(result.paused) ? result.paused : [],
    };
  } catch (error) {
    return { ...empty, ...failure(error) };
  }
}

export async function getPyqQuestions({ uid = 0, cid = 1, examId, examType = "pqp" } = {}) {
  if (!examId) return { status: false, httpStatus: 400, imagePath: "", data: [] };
  try {
    const result = await requestExam("getMockTestQuestions", { uid, cid, examid: examId, examtype: examType });
    return {
      status: true, httpStatus: 200, imagePath: result.img_path ?? "",
      data: Array.isArray(result.data) ? result.data : [],
    };
  } catch (error) {
    return { ...failure(error), imagePath: "", data: [] };
  }
}
