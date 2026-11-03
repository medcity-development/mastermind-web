import "server-only";

import { executePscRequest, setPscRateLimit } from "@/lib/pscRequestManager";
import { createSlug } from "@/lib/pscSlug";
import { getSubCategories } from "@/lib/pscApi";
import { getPreviousQuestions } from "@/lib/pyqHelper";

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

export async function getPyqExamBySlug({ uid = 0, cid = 1, slug, type = "pqp" } = {}) {
  const examSlug = String(slug ?? "").trim();
  if (!examSlug) throw new Error("Previous question paper slug is required.");

  const firstPage = await getPreviousQuestions({
    uid,
    cid,
    offset: 0,
    type,
    filter: 0,
  });
  if (firstPage?.error) {
    throw new Error(firstPage.message || "Unable to load previous question papers.");
  }

  const allQuestionsExam = (Array.isArray(firstPage?.data) ? firstPage.data : [])
    .find((item) => createSlug(item?.exam_name) === examSlug);
  if (allQuestionsExam) return allQuestionsExam;

  let categoriesResult;
  let lookupError = null;
  try {
    categoriesResult = await getSubCategories({ cid, uid });
  } catch (error) {
    lookupError = error?.message || "Unable to load previous question papers.";
  }

  if (
    categoriesResult?.status === false &&
    categoriesResult?.message
  ) {
    lookupError ??= categoriesResult.message;
  }

  const filters = [
    ...new Set(
      (Array.isArray(categoriesResult?.categories)
        ? categoriesResult.categories
        : []
      )
        .map((category) => Number(category?.id ?? category?.sub_id))
        .filter((filter) => Number.isSafeInteger(filter) && filter > 0)
    ),
  ];

  const remainingPages = [];
  if (
    firstPage?.nextOffset !== null &&
    firstPage?.nextOffset !== undefined &&
    firstPage?.nextOffset !== ""
  ) {
    const offset = Number(firstPage.nextOffset);
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("Previous question paper list returned an invalid next page.");
    }
    remainingPages.push({ filter: 0, offset });
  }

  for (const filter of filters) {
    const result = await getPreviousQuestions({
      uid,
      cid,
      offset: 0,
      type,
      filter,
    });
    if (result?.error) {
      throw new Error(result.message || "Unable to load previous question papers.");
    }

    const exam = (Array.isArray(result?.data) ? result.data : [])
      .find((item) => createSlug(item?.exam_name) === examSlug);
    if (exam) return exam;

    if (result?.nextOffset !== null && result?.nextOffset !== undefined && result?.nextOffset !== "") {
      const offset = Number(result.nextOffset);
      if (!Number.isSafeInteger(offset) || offset < 0) {
        throw new Error("Previous question paper list returned an invalid next page.");
      }

      remainingPages.push({
        filter,
        offset,
      });
    }
  }

  for (const page of remainingPages) {
    let offset = page.offset;
    const visitedOffsets = new Set();

    while (true) {
      if (visitedOffsets.has(offset)) {
        throw new Error("Previous question paper list pagination did not advance.");
      }
      visitedOffsets.add(offset);

      const result = await getPreviousQuestions({
        uid,
        cid,
        offset,
        type,
        filter: page.filter,
      });

      if (result?.error) {
        throw new Error(result.message || "Unable to load previous question papers.");
      }

      const data = Array.isArray(result?.data) ? result.data : [];
      if (!data.length) {
        break;
      }

      const exam = data
        .find((item) => createSlug(item?.exam_name) === examSlug);
      if (exam) return exam;

      const nextOffset = result?.nextOffset;
      if (nextOffset === null || nextOffset === undefined || nextOffset === "") {
        break;
      }

      const parsedOffset = Number(nextOffset);
      if (!Number.isSafeInteger(parsedOffset) || parsedOffset < 0) {
        throw new Error("Previous question paper list returned an invalid next page.");
      }
      offset = parsedOffset;
    }
  }

  if (lookupError) {
    throw new Error(lookupError);
  }

  return null;
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
