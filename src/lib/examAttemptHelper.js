
// src/lib/examAttemptHelper.js

import {
  getAttemptId,
  isFailedResponse,
} from "./examAttemptData";

/* =========================================================
   ENV
========================================================= */

const API_BASE_URL =
  process.env.PSC_API_BASE_URL;

const API_KEY =
  process.env.PSC_API_KEY;

/* =========================================================
   HELPERS
========================================================= */

function cleanBaseUrl(value = "") {
  return String(value)
    .trim()
    .replace(/\/+$/, "");
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function normalizeExamType(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeExamStatus(value) {
  const status = normalizeString(value)
    .toLowerCase();

  if (
    status === "finish" ||
    status === "finished" ||
    status === "complete" ||
    status === "completed"
  ) {
    return "finish";
  }

  if (
    status === "pause" ||
    status === "paused"
  ) {
    return "pause";
  }

  return status;
}

function getPositiveNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : null;
}

/* =========================================================
   APPEND FORM VALUE
========================================================= */

function appendFormValue(
  formData,
  key,
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (Array.isArray(value)) {
    formData.append(
      key,
      key === "user_answers"
        ? JSON.stringify(value)
        : `[${value.join(", ")}]`
    );

    return;
  }

  if (typeof value === "object") {
    formData.append(
      key,
      JSON.stringify(value)
    );

    return;
  }

  formData.append(key, String(value));
}

/* =========================================================
   COMMON API REQUEST
========================================================= */

async function sendExamRequest(
  endpoint,
  payload = {}
) {
  if (!API_BASE_URL || !API_KEY) {
    const error = new Error(
      "PSC API configuration is missing."
    );

    error.httpStatus = 500;
    throw error;
  }

  const formData = new FormData();

  formData.append("api", API_KEY);

  const requestPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([key]) => key !== "__scoring"
    )
  );

  if (
    requestPayload.paused_time != null &&
    Number(requestPayload.paused_time) > 0 &&
    Number(requestPayload.paused_time) <= 86400
  ) {
    requestPayload.paused_time = Math.round(
      Number(requestPayload.paused_time) * 1000
    );
  }

  Object.entries(requestPayload).forEach(
    ([key, value]) =>
      appendFormValue(formData, key, value)
  );

  let response;

  try {
    response = await fetch(
      `${cleanBaseUrl(API_BASE_URL)}/${endpoint}`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
      }
    );
  } catch (cause) {
    const error = new Error(
      `Unable to reach ${endpoint}.`
    );

    error.httpStatus = 503;
    throw error;
  }

  const raw = await response.text();

  let result;

  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    const phpError =
      /Undefined variable|Undefined index|Fatal error|Warning:/i.test(
        raw
      );

    const error = new Error(
      phpError
        ? "The exam backend encountered a PHP error. Please contact support."
        : `Invalid response from ${endpoint}.`
    );

    error.httpStatus =
      response.status === 429 ? 429 : 502;

    throw error;
  }

  // PHP may return an error in JSON with HTTP 200.
  if (
    result?.status === false &&
    /Undefined variable|Undefined index|Fatal error|Warning:/i.test(
      String(
        result?.message ||
        result?.msg ||
        ""
      )
    )
  ) {
    const error = new Error(
      "The exam backend could not load this saved attempt."
    );

    error.httpStatus = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 429
        ? "Too many exam requests. Please wait before trying again."
        : result?.message ||
        result?.msg ||
        `${endpoint} failed (HTTP ${response.status}).`
    );

    error.httpStatus = response.status;

    error.retryAfter =
      response.headers.get("retry-after");

    throw error;
  }

  return result;
}

/* =========================================================
   FAILURE NORMALIZER
========================================================= */

function normalizeFailure(
  result,
  fallbackMessage
) {
  if (!isFailedResponse(result)) {
    return null;
  }

  return {
    ...(result && typeof result === "object"
      ? result
      : {}),

    status: false,

    message:
      result?.message ||
      result?.msg ||
      fallbackMessage,

    data: Array.isArray(result?.data)
      ? result.data
      : [],

    details: Array.isArray(result?.details)
      ? result.details
      : [],
  };
}

/* =========================================================
   CREATE ATTEMPT
   POST /setNewUserExams
========================================================= */

export async function createUserExamAttempt(
  payload = {}
) {
  try {
    const result = await sendExamRequest(
      "setNewUserExams",
      payload
    );

    const failed = normalizeFailure(
      result,
      "Unable to save exam attempt."
    );

    if (failed) {
      return failed;
    }

    const attemptId = getAttemptId(result);

    return {
      ...result,

      ...(attemptId
        ? { pauseid: attemptId }
        : {}),
    };
  } catch (error) {
    console.error(
      "createUserExamAttempt:",
      error
    );

    return {
      status: false,
      message:
        error?.message ||
        "Unable to save exam attempt.",
      data: [],
      details: [],
    };
  }
}

/* =========================================================
   UPDATE ATTEMPT
   POST /setUpdateUserExams
========================================================= */

export async function updateUserExamAttempt(
  payload = {}
) {
  try {
    if (!payload?.pauseid) {
      throw new Error(
        "pauseid is required."
      );
    }

    const result = await sendExamRequest(
      "setUpdateUserExams",
      payload
    );

    const failed = normalizeFailure(
      result,
      "Unable to update exam attempt."
    );

    if (failed) {
      return failed;
    }

    return {
      ...result,

      pauseid:
        payload.pauseid ??
        getAttemptId(result),
    };
  } catch (error) {
    console.error(
      "updateUserExamAttempt:",
      error
    );

    return {
      status: false,
      message:
        error?.message ||
        "Unable to update exam attempt.",
      data: [],
      details: [],
    };
  }
}

/* =========================================================
   GET USER EXAMS LIST
   POST /getUserExamsList
========================================================= */

export async function getUserExamsList({
  uid,
  cid,
  exam_type,
} = {}) {
  try {
    const safeUid =
      getPositiveNumber(uid);

    const safeCid =
      getPositiveNumber(cid);

    const safeExamType =
      normalizeExamType(exam_type);

    if (!safeUid) {
      throw new Error(
        "Valid uid is required."
      );
    }

    if (!safeExamType) {
      throw new Error(
        "exam_type is required."
      );
    }

    const result = await sendExamRequest(
      "getUserExamsList",
      {
        uid: safeUid,
        ...(safeCid ? { cid: safeCid } : {}),
        exam_type: safeExamType,
      }
    );

    const hasAttemptRecords = [
      result?.details,
      result?.data,
      result?.result,
      result?.results,
      result?.exams,
      result?.data?.details,
      result?.data?.data,
      result?.result?.details,
    ].some(
      (records) =>
        Array.isArray(records) &&
        records.length > 0
    );

    const backendMessage = String(
      result?.message ??
      result?.msg ??
      ""
    ).trim();

    if (
      isFailedResponse(result) &&
      !backendMessage &&
      !hasAttemptRecords
    ) {
      return {
        ...result,
        status: true,
        empty: true,
        details: [],
        data: [],
      };
    }

    const failed = normalizeFailure(
      result,
      "Unable to load saved exams."
    );

    if (failed) {
      return failed;
    }

    return result;
  } catch (error) {
    console.error(
      "getUserExamsList:",
      error
    );

    return {
      status: false,
      message:
        error?.message ||
        "Unable to load saved exams.",
      data: [],
      details: [],
    };
  }
}

/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

export async function getUserExamList(
  options = {}
) {
  return getUserExamsList(options);
}

/* =========================================================
   USER EXAM ANALYTICS
   POST /getUserExamAnalytics
========================================================= */

export async function getUserExamAnalytics({
  uid,
  cid,
  exam_type,
  exam_id,
  exam_status,
} = {}) {
  try {
    const safeUid =
      getPositiveNumber(uid);

    const safeCid =
      getPositiveNumber(cid);

    const safeExamId =
      getPositiveNumber(exam_id);

    const safeExamType =
      normalizeExamType(exam_type);

    const safeExamStatus =
      normalizeExamStatus(exam_status);

    if (!safeUid) {
      throw new Error(
        "Valid uid is required."
      );
    }

    if (!safeCid) {
      throw new Error(
        "Valid cid is required."
      );
    }

    if (!safeExamType) {
      throw new Error(
        "exam_type is required."
      );
    }

    if (!safeExamId) {
      throw new Error(
        "Valid exam_id is required."
      );
    }

    const payload = {
      uid: safeUid,
      cid: safeCid,
      exam_type: safeExamType,
      exam_id: safeExamId,
    };

    if (safeExamStatus) {
      payload.exam_status = safeExamStatus;
    }

    const result = await sendExamRequest(
      "getUserExamAnalytics",
      payload
    );

    const failed = normalizeFailure(
      result,
      "Unable to load exam analytics."
    );

    if (failed) {
      return failed;
    }

    return result;
  } catch (error) {
    console.error(
      "getUserExamAnalytics:",
      error
    );

    return {
      status: false,
      message:
        error?.message ||
        "Unable to load exam analytics.",
      data: [],
      details: [],
    };
  }
}

/* =========================================================
   COMPATIBILITY ALIAS
========================================================= */

export async function getUserAnalytics(
  options = {}
) {
  return getUserExamAnalytics(options);
}

/* =========================================================
   GET SAVED ATTEMPT DETAILS
   POST /getExamAnalyticDetails

   IMPORTANT:
   id = saved attempt ID, not exam_id
========================================================= */

export async function getExamAnalyticDetails({
  uid,
  cid,
  id,
  exam_type,
} = {}) {
  try {
    const safeUid =
      getPositiveNumber(uid);

    const safeCid =
      getPositiveNumber(cid);

    const safeId =
      getPositiveNumber(id);

    const safeExamType =
      normalizeExamType(exam_type);

    if (!safeUid) {
      throw new Error(
        "Valid uid is required."
      );
    }

    if (!safeCid) {
      throw new Error(
        "Valid cid is required."
      );
    }

    if (!safeId) {
      throw new Error(
        "Valid attempt id is required."
      );
    }

    if (!safeExamType) {
      throw new Error(
        "exam_type is required."
      );
    }

    const result = await sendExamRequest(
      "getExamAnalyticDetails",
      {
        uid: safeUid,
        cid: safeCid,
        id: safeId,
        exam_type: safeExamType,
      }
    );

    const failed = normalizeFailure(
      result,
      "Unable to load exam analytic details."
    );

    if (failed) {
      return failed;
    }

    return result;
  } catch (error) {
    console.error(
      "getExamAnalyticDetails:",
      error
    );

    return {
      status: false,

      message:
        error?.message ||
        "Unable to load exam analytic details.",

      httpStatus:
        error?.httpStatus || 502,

      retryAfter:
        error?.retryAfter || null,

      data: [],
      details: [],
    };
  }
}
