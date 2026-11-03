import { unstable_cache } from "next/cache";
import {
  executePscRequest,
  setPscRateLimit,
} from "@/lib/pscRequestManager";
import { applyPackageAccess } from "@/lib/packageAccess";
// src/lib/pyqHelper.js

const getCachedPreviousQuestionResponse = unstable_cache(
  async (uid, cid, subId, offset, type, filter) => {
    const formData = new FormData();
    formData.append("api", process.env.PSC_API_KEY);
    formData.append("uid", String(uid));
    if (cid != null) formData.append("cid", String(cid));
    if (subId != null) formData.append("subid", String(subId));
    formData.append("offset", String(offset));
    formData.append("type", String(type));
    formData.append("filter", String(filter));

    const apiBase = String(process.env.PSC_API_BASE_URL || "")
      .trim()
      .replace(/\/+$/, "");
    if (!apiBase || !process.env.PSC_API_KEY) {
      throw new Error("PSC API configuration is missing.");
    }

    const requestFields = {
      uid,
      cid,
      subId,
      offset,
      type,
      filter,
    };
    const response = await executePscRequest({
      key: JSON.stringify({
        endpoint: "getPQPTestListbyOffset",
        fields: requestFields,
      }),
      task: () =>
        fetch(`${apiBase}/getPQPTestListbyOffset`, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15000),
        }),
    });

    if (!response.ok) {
      throw Object.assign(
        new Error(`PQP API failed: ${response.status}`),
        { httpStatus: response.status }
      );
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("PQP API returned invalid JSON.");
    }

    const message = String(result?.message ?? result?.msg ?? "");
    if (
      result?.rateLimited === true ||
      Number(result?.status) === 429 ||
      Number(result?.httpStatus) === 429 ||
      Number(result?.code) === 429 ||
      /too many attempts|too many requests|rate[\s-]?limit/i.test(message)
    ) {
      const retryAfter = setPscRateLimit(
        result?.retryAfter ?? result?.retry_after
      );
      throw Object.assign(
        new Error(message || "PSC backend is temporarily rate-limited."),
        { httpStatus: 429, retryAfter }
      );
    }

    return result;
  },
  ["previous-question-list"],
  { revalidate: 120, tags: ["previous-question-list"] }
);

export async function getPreviousQuestions({
  uid = 0,
  cid,
  subId,
  offset = 0,
  type = "pqp",
  filter = 0,
} = {}) {
  try {
    const result = await getCachedPreviousQuestionResponse(
      Number(uid) || 0,
      cid == null ? null : Number(cid),
      subId == null ? null : Number(subId),
      Number(offset) || 0,
      String(type),
      Number(filter) || 0
    );
    const accessibleResult = await applyPackageAccess(
      result,
      { cid, contentType: "pqp" }
    );

    return {
      status:
        accessibleResult?.status ??
        false,

      message:
        accessibleResult?.message ??
        accessibleResult?.msg ??
        "",

      view:
        accessibleResult?.view ??
        "",

      nextOffset:
        accessibleResult?.nextoffset ??
        accessibleResult?.nextOffset ??
        null,

      data:
        Array.isArray(
          accessibleResult?.data
        )
          ? accessibleResult.data
          : [],
    };
  } catch (error) {
    console.error(
      "getPreviousQuestions:",
      error
    );

    return {
      status: false,
      error: true,
      message:
        error?.message ||
        "Unable to load previous question papers.",
      retryAfter: error?.retryAfter ?? null,
      view: "",
      nextOffset: null,
      data: [],
    };
  }
}