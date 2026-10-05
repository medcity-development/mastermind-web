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
   CLEAN BASE URL
========================================================= */

function cleanBaseUrl(
  value = ""
) {
  return String(value)
    .trim()
    .replace(/\/+$/, "");
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeString(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

function normalizeExamType(
  value
) {
  return normalizeString(
    value
  ).toLowerCase();
}

function normalizeExamStatus(
  value
) {
  const status =
    normalizeString(
      value
    ).toLowerCase();

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

function getPositiveNumber(
  value
) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  ) &&
    parsed > 0
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
      `[${value.join(", ")}]`
    );

    return;
  }

  if (
    typeof value ===
    "object"
  ) {
    formData.append(
      key,
      JSON.stringify(
        value
      )
    );

    return;
  }

  formData.append(
    key,
    String(value)
  );
}

/* =========================================================
   COMMON REQUEST
========================================================= */

async function sendExamRequest(
  endpoint,
  payload = {}
) {
  if (!API_BASE_URL) {
    throw new Error(
      "PSC_API_BASE_URL is missing."
    );
  }

  if (!API_KEY) {
    throw new Error(
      "PSC_API_KEY is missing."
    );
  }

  const baseUrl =
    cleanBaseUrl(
      API_BASE_URL
    );

  const url =
    `${baseUrl}/${endpoint}`;

  const formData =
    new FormData();

  formData.append(
    "api",
    API_KEY
  );

  Object.entries(
    payload
  ).forEach(
    ([key, value]) => {
      appendFormValue(
        formData,
        key,
        value
      );
    }
  );

  console.log(
    `EXAM API REQUEST -> ${endpoint}`,
    payload
  );

  let response;

  try {
    response =
      await fetch(
        url,
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",

          headers: {
            Accept:
              "application/json",
          },
        }
      );
  } catch (error) {
    console.error(
      `${endpoint} NETWORK ERROR:`,
      error
    );

    throw new Error(
      `Unable to reach ${endpoint}.`
    );
  }

  const rawText =
    await response.text();

  let result;

  try {
    result =
      rawText
        ? JSON.parse(
            rawText
          )
        : {};
  } catch {
    console.error(
      `${endpoint} INVALID JSON`
    );

    console.error(
      `${endpoint} STATUS:`,
      response.status
    );

    console.error(
      `${endpoint} RAW RESPONSE:`,
      rawText
    );

    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.msg ||
        `${endpoint} failed with HTTP ${response.status}.`
    );
  }

  console.log(
    `EXAM API RESPONSE -> ${endpoint}`,
    result
  );

  return result;
}

/* =========================================================
   FAILURE NORMALIZER
========================================================= */

function normalizeFailure(
  result,
  fallbackMessage
) {
  if (
    !isFailedResponse(
      result
    )
  ) {
    return null;
  }

  return {
    ...(result &&
    typeof result ===
      "object"
      ? result
      : {}),

    status:
      false,

    message:
      result?.message ||
      result?.msg ||
      fallbackMessage,

    data:
      Array.isArray(
        result?.data
      )
        ? result.data
        : [],

    details:
      Array.isArray(
        result?.details
      )
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
    const result =
      await sendExamRequest(
        "setNewUserExams",
        payload
      );

    const failed =
      normalizeFailure(
        result,
        "Unable to save exam attempt."
      );

    if (failed) {
      return failed;
    }

    const attemptId =
      getAttemptId(
        result
      );

    return {
      ...result,

      ...(attemptId
        ? {
            pauseid:
              attemptId,
          }
        : {}),
    };
  } catch (error) {
    console.error(
      "createUserExamAttempt:",
      error
    );

    return {
      status:
        false,

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

    const result =
      await sendExamRequest(
        "setUpdateUserExams",
        payload
      );

    const failed =
      normalizeFailure(
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
        getAttemptId(
          result
        ),
    };
  } catch (error) {
    console.error(
      "updateUserExamAttempt:",
      error
    );

    return {
      status:
        false,

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

   IMPORTANT:
   Correct endpoint supplied by backend:

   POST /getUserExamsList

   api
   uid
   exam_type
========================================================= */

export async function getUserExamsList({
  uid,
  exam_type,
} = {}) {
  try {
    const safeUid =
      getPositiveNumber(
        uid
      );

    const safeExamType =
      normalizeExamType(
        exam_type
      );

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

    const result =
      await sendExamRequest(
        "getUserExamsList",
        {
          uid:
            safeUid,

          exam_type:
            safeExamType,
        }
      );

    const failed =
      normalizeFailure(
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
      status:
        false,

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

   Remove later after all old imports are updated.
========================================================= */

export async function getUserExamList(
  options = {}
) {
  return getUserExamsList(
    options
  );
}

/* =========================================================
   USER EXAM ANALYTICS

   POST /getUserExamAnalytics

   api
   uid
   cid
   exam_type
   exam_id

   exam_status = optional
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
      getPositiveNumber(
        uid
      );

    const safeCid =
      getPositiveNumber(
        cid
      );

    const safeExamId =
      getPositiveNumber(
        exam_id
      );

    const safeExamType =
      normalizeExamType(
        exam_type
      );

    const safeExamStatus =
      normalizeExamStatus(
        exam_status
      );

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
      uid:
        safeUid,

      cid:
        safeCid,

      exam_type:
        safeExamType,

      exam_id:
        safeExamId,
    };

    if (safeExamStatus) {
      payload.exam_status =
        safeExamStatus;
    }

    const result =
      await sendExamRequest(
        "getUserExamAnalytics",
        payload
      );

    const failed =
      normalizeFailure(
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
      status:
        false,

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
  return getUserExamAnalytics(
    options
  );
}

/* =========================================================
   GET SAVED ATTEMPT DETAILS

   POST /getExamAnalyticDetails

   api
   uid
   cid
   id
   exam_type

   NOTE:
   id = saved attempt id
========================================================= */

export async function getExamAnalyticDetails({
  uid,
  cid,
  id,
  exam_type,
} = {}) {
  try {
    const safeUid =
      getPositiveNumber(
        uid
      );

    const safeCid =
      getPositiveNumber(
        cid
      );

    const safeId =
      getPositiveNumber(
        id
      );

    const safeExamType =
      normalizeExamType(
        exam_type
      );

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

    const result =
      await sendExamRequest(
        "getExamAnalyticDetails",
        {
          uid:
            safeUid,

          cid:
            safeCid,

          id:
            safeId,

          exam_type:
            safeExamType,
        }
      );

    const failed =
      normalizeFailure(
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
      status:
        false,

      message:
        error?.message ||
        "Unable to load exam analytic details.",

      data: [],
      details: [],
    };
  }
}