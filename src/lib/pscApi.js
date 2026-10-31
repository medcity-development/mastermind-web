
import "server-only";

import { applyPackageAccess } from "@/lib/packageAccess";
import {
  createSlug,
  normalizeCourseSlug,
} from "@/lib/pscSlug";

import {
  executePscRequest,
  setPscRateLimit,
  getPscCooldownSeconds,
} from "@/lib/pscRequestManager";
/* =========================================================
   API CONFIGURATION
========================================================= */

function getApiConfig() {
  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!apiBaseUrl) {
    throw new Error("PSC_API_BASE_URL is missing.");
  }

  if (!apiKey) {
    throw new Error("PSC_API_KEY is missing.");
  }

  return {
    apiBaseUrl: String(apiBaseUrl).trim().replace(/\/+$/, ""),
    apiKey: String(apiKey).trim(),
  };
}

function requireCid(cid) {
  if (
    cid === undefined ||
    cid === null ||
    cid === ""
  ) {
    throw new Error("Course ID is required.");
  }

  return String(cid);
}

function isPscSuccessStatus(status) {
  return (
    status === true ||
    status === 1 ||
    ["1", "true"].includes(
      String(status ?? "").trim().toLowerCase()
    )
  );
}

/* =========================================================
   SHARED API REQUEST
========================================================= */


async function postRequest({
  endpoint,
  fields = {},
  cache,
  revalidate = 3600,
} = {}) {
  const { apiBaseUrl, apiKey } = getApiConfig();

  if (!endpoint) {
    throw new Error("API endpoint is required.");
  }

  const cleanEndpoint = String(endpoint)
    .trim()
    .replace(/^\/+/, "");

  const url = `${apiBaseUrl}/${cleanEndpoint}`;

  const formData = new FormData();
  formData.append("api", apiKey);

  Object.entries(fields).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    formData.append(key, String(value));
  });

  const fetchOptions = {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
    redirect: "follow",
  };

  if (cache) {
    fetchOptions.cache = cache;
  } else {
    fetchOptions.next = { revalidate };
  }

  const requestKey = JSON.stringify({
    endpoint: cleanEndpoint,
    fields: Object.entries(fields)
      .filter(([, value]) => value != null && value !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
    cache: cache ?? null,
    revalidate,
  });

  let response;

  try {
    response = await executePscRequest({
      key: requestKey,
      task: () => fetch(url, fetchOptions),
    });
  } catch (error) {
    if (
      error?.httpStatus === 429 ||
      error?.status === 429
    ) {
      throw error;
    }

    console.error("PSC API FETCH ERROR:", {
      endpoint: cleanEndpoint,
      message: error?.message,
    });

    const failure = new Error(
      `${cleanEndpoint} request failed.`
    );

    failure.httpStatus = 503;
    failure.status = 503;

    throw failure;
  }

  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `${cleanEndpoint} returned an empty response.`
    );
  }

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `${cleanEndpoint} returned invalid JSON.`
    );
  }

  const message = String(
    result?.message ??
    result?.msg ??
    ""
  );

  const bodyRateLimited =
    Number(result?.status) === 429 ||
    Number(result?.code) === 429 ||
    result?.rateLimited === true ||
    /too many attempts|too many requests|rate.limit/i.test(
      message
    );

  if (bodyRateLimited) {
    const retryAfter = setPscRateLimit(
      response.headers.get("Retry-After") ??
      result?.retryAfter ??
      result?.retry_after
    );

    const error = new Error(
      "PSC backend is temporarily rate-limited."
    );

    error.httpStatus = 429;
    error.status = 429;
    error.retryAfter =
      retryAfter || getPscCooldownSeconds();

    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      message ||
        `${cleanEndpoint} failed with status ${response.status}.`
    );

    error.httpStatus = response.status;
    error.status = response.status;

    throw error;
  }

  return applyPackageAccess(result, {
    ...fields,
    courseListing:
      cleanEndpoint === "getSubExamsList",
    contentType:
      cleanEndpoint === "getMockTestDetails"
        ? fields.type || "mock"
        : undefined,
  });
}


/* =========================================================
   MOCK TEST DETAILS
========================================================= */

export async function getMockTestDetails({
  uid = 0,
  cid,
  examId,
  type = "mock",
} = {}) {
  try {
    const safeCid = requireCid(cid);

    if (
      examId === undefined ||
      examId === null ||
      examId === ""
    ) {
      return {
        status: false,
        exam: [],
        data: [],
        message: "examId is required.",
        raw: null,
      };
    }

    const result = await postRequest({
      endpoint: "getMockTestDetails",
      fields: {
        cid: safeCid,
        uid: String(uid ?? 0),
        examid: String(examId),
        type: String(type || "mock"),
      },
      cache: "no-store",
    });

    return {
      ...result,
      status: result?.status !== false,
      exam: result?.exam ?? [],
      data: result?.data ?? [],
      raw: result,
    };
  } catch (error) {
    console.error("getMockTestDetails:", error);

    return {
      status: false,
      exam: [],
      data: [],
      message:
        error?.message ||
        "Unable to load mock test details.",
      raw: null,
    };
  }
}

/* =========================================================
   MAIN COURSES
========================================================= */

export async function getMainCourses() {
  try {
    const result = await postRequest({
      endpoint: "getCourses",
      revalidate: 3600,
    });

    return {
      status: result?.status !== false,
      filePath: String(
        result?.file_path ??
        result?.icon_path ??
        ""
      ),
      courses: Array.isArray(result?.data)
        ? result.data
        : [],
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getMainCourses:", error);

    return {
      status: false,
      filePath: "",
      courses: [],
      message:
        error?.message ||
        "Unable to load main courses.",
      raw: null,
    };
  }
}

/* =========================================================
   HOME RESPONSES
========================================================= */

export async function getHomeResponses({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    const result = await postRequest({
      endpoint: "getHomeResponses",
      fields: {
        uid: String(uid ?? 0),
        cid: safeCid,
      },
      revalidate: 3600,
    });

    return {
      status: result?.status !== false,
      gridIconPath: String(
        result?.grid_icon_path ?? ""
      ),
      categoryIconPath: String(
        result?.category_icon_path ?? ""
      ),
      subcategoryIconPath: String(
        result?.subcategory_icon_path ?? ""
      ),
      sliderImagePath: String(
        result?.slider_image_path ?? ""
      ),
      subjectIconPath: String(
        result?.subject_icon_path ?? ""
      ),
      packageIconPath: String(
        result?.package_icon_path ?? ""
      ),
      subexamIconPath: String(
        result?.subexam_icon_path ?? ""
      ),
      rankfilePath: String(
        result?.rankfile_path ?? ""
      ),
      grid: Array.isArray(result?.grid)
        ? result.grid
        : [],
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getHomeResponses:", error);

    return {
      status: false,
      gridIconPath: "",
      categoryIconPath: "",
      subcategoryIconPath: "",
      sliderImagePath: "",
      subjectIconPath: "",
      packageIconPath: "",
      subexamIconPath: "",
      rankfilePath: "",
      grid: [],
      message:
        error?.message ||
        "Unable to load home responses.",
      raw: null,
    };
  }
}

/* =========================================================
   SUB CATEGORIES
========================================================= */

export async function getSubCategories({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    const result = await postRequest({
      endpoint: "getSubCategoriesNew",
      fields: {
        cid: safeCid,
        uid: String(uid ?? 0),
      },
      cache: "no-store",
    });

    const rawCategories = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.categories)
        ? result.categories
        : [];

    const categories = rawCategories.filter((item) => {
      const status = String(item?.status ?? "1")
        .trim()
        .toLowerCase();

      return status === "1" || status === "active";
    });

    return {
      status: result?.status !== false,
      filePath: String(
        result?.file_path ??
        result?.filePath ??
        result?.icon_path ??
        ""
      ),
      categories,
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getSubCategories:", error);

    return {
      status: false,
      filePath: "",
      categories: [],
      message:
        error?.message ||
        "Unable to load exam categories.",
      raw: null,
    };
  }
}

/* =========================================================
   SUB EXAMS
========================================================= */

export async function getSubExams({
  cid,
  uid = 0,
  subId,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    if (
      subId === undefined ||
      subId === null ||
      subId === ""
    ) {
      return {
        status: false,
        iconPath: "",
        exams: [],
        message: "Sub category ID is required.",
        raw: null,
      };
    }

    const result = await postRequest({
      endpoint: "getSubExamsList",
      fields: {
        cid: safeCid,
        uid: String(uid ?? 0),
        sub_id: String(subId),
      },
      cache: "no-store",
    });

    const rawExams = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.exams)
        ? result.exams
        : [];

    const exams = rawExams.filter((item) => {
      const status = String(item?.status ?? "1")
        .trim()
        .toLowerCase();

      return status === "1" || status === "active";
    });

    return {
      status: result?.status !== false,
      iconPath: String(
        result?.icon_path ??
        result?.file_path ??
        result?.filePath ??
        ""
      ),
      exams,
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getSubExams:", error);

    return {
      status: false,
      iconPath: "",
      exams: [],
      message:
        error?.message ||
        "Unable to load sub exams.",
      raw: null,
    };
  }
}

/* =========================================================
   MOCK EXAM SUB CATEGORIES
========================================================= */

export async function getMockExamSubCategories({
  cid,
  uid = 0,
  subId = 2,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    if (
      subId === undefined ||
      subId === null ||
      subId === ""
    ) {
      return {
        status: false,
        categories: [],
        message: "subId is required.",
        raw: null,
      };
    }

    const result = await postRequest({
      endpoint: "getMockExamSubcategories",
      fields: {
        cid: safeCid,
        uid: String(uid ?? 0),
        subid: String(subId),
      },
      cache: "no-store",
    });

    const categories = Array.isArray(result?.data)
      ? result.data
          .filter(
            (item) =>
              item?.id !== undefined &&
              item?.id !== null &&
              String(
                item?.subcourse ?? ""
              ).trim()
          )
          .map((item) => ({
            ...item,
            id: Number(item.id),
            subcourse: String(
              item.subcourse
            ).trim(),
          }))
      : [];

    return {
      status: result?.status !== false,
      categories,
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error(
      "getMockExamSubCategories:",
      error
    );

    return {
      status: false,
      categories: [],
      message:
        error?.message ||
        "Unable to load mock exam categories.",
      raw: null,
    };
  }
}

/* =========================================================
   EXAM NOTIFICATIONS
========================================================= */

export async function getExamNotifications({
  cid,
  uid = 0,
  offset = 0,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    const result = await postRequest({
      endpoint: "getPscNotificationsCid",
      fields: {
        uid: String(uid ?? 0),
        cid: safeCid,
        offset: String(offset ?? 0),
      },
      cache: "no-store",
    });

    return {
      status: result?.status !== false,
      nextOffset:
        result?.nextoffset ??
        result?.nextOffset ??
        null,
      filePath: String(
        result?.file_path ??
        result?.filePath ??
        ""
      ),
      notifications: Array.isArray(result?.data)
        ? result.data
        : [],
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getExamNotifications:", error);

    return {
      status: false,
      nextOffset: null,
      filePath: "",
      notifications: [],
      message:
        error?.message ||
        "Unable to load notifications.",
      raw: null,
    };
  }
}

/* =========================================================
   STUDENT NOTIFICATION CACHE AND RATE LIMITING
========================================================= */

const notificationCache = new Map();
const notificationPending = new Map();
const notificationCooldown = new Map();
const notificationMutationPending = new Map();

const NOTIFICATION_TTL_MS = 15_000;
const NOTIFICATION_DEFAULT_COOLDOWN_MS = 60_000;

function notificationKey(uid, cid) {
  return `${uid}:${cid}`;
}

function validPositiveId(value) {
  return /^[1-9]\d*$/.test(String(value ?? ""));
}

function clearStudentNotificationCache(uid) {
  const prefix = `${uid}:`;

  for (const key of notificationCache.keys()) {
    if (key.startsWith(prefix)) {
      notificationCache.delete(key);
    }
  }
}

function notificationFailure(error, fallback) {
  const limited =
    error?.httpStatus === 429 ||
    error?.status === 429 ||
    /429|too many attempts|rate limit/i.test(
      String(error?.message || "")
    );

  const retryAfter = Number(error?.retryAfter);

  return {
    status: false,
    message: limited
      ? "Notification service is temporarily rate limited. Please try again later."
      : error?.message || fallback,
    ...(limited
      ? {
          httpStatus: 429,
          retryAfter:
            Number.isFinite(retryAfter) &&
            retryAfter > 0
              ? Math.ceil(retryAfter)
              : 60,
        }
      : {}),
  };
}

/* =========================================================
   GET STUDENT NOTIFICATIONS
========================================================= */

export async function getStudentNotifications({
  uid,
  cid,
} = {}) {
  const studentId = String(uid ?? "");

  if (!validPositiveId(studentId)) {
    return {
      status: false,
      notifications: [],
      message: "A valid student ID is required.",
    };
  }

  let courseId;

  try {
    courseId = requireCid(cid);
  } catch (error) {
    return {
      status: false,
      notifications: [],
      message: error.message,
    };
  }

  const key = notificationKey(studentId, courseId);
  const now = Date.now();

  const cached = notificationCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const blockedUntil =
    notificationCooldown.get(key) || 0;

  if (blockedUntil > now) {
    return {
      status: false,
      notifications: [],
      httpStatus: 429,
      retryAfter: Math.ceil(
        (blockedUntil - now) / 1000
      ),
      message:
        "Notification service is temporarily rate limited.",
    };
  }

  if (notificationPending.has(key)) {
    return notificationPending.get(key);
  }

  const request = (async () => {
    try {
      const result = await postRequest({
        endpoint: "getNotificationsCid",
        fields: {
          uid: studentId,
          cid: courseId,
        },
        cache: "no-store",
      });

      const response = {
        status: isPscSuccessStatus(
          result?.status
        ),
        notifications: Array.isArray(
          result?.details
        )
          ? result.details
          : Array.isArray(result?.data)
            ? result.data
            : [],
        message:
          result?.message ??
          result?.msg ??
          "",
      };

      if (response.status) {
        notificationCache.set(key, {
          value: response,
          expiresAt:
            Date.now() + NOTIFICATION_TTL_MS,
        });

        notificationCooldown.delete(key);
      } else if (
        /too many attempts|rate limit/i.test(
          response.message
        )
      ) {
        notificationCooldown.set(
          key,
          Date.now() +
            NOTIFICATION_DEFAULT_COOLDOWN_MS
        );

        return {
          ...response,
          httpStatus: 429,
          retryAfter: 60,
        };
      }

      return response;
    } catch (error) {
      console.error(
        "getStudentNotifications:",
        error
      );

      const failure = notificationFailure(
        error,
        "Unable to load notifications."
      );

      if (failure.httpStatus === 429) {
        notificationCooldown.set(
          key,
          Date.now() +
            failure.retryAfter * 1000
        );
      }

      return {
        ...failure,
        notifications: [],
      };
    } finally {
      notificationPending.delete(key);
    }
  })();

  notificationPending.set(key, request);

  return request;
}

/* =========================================================
   NOTIFICATION MUTATION DEDUPLICATION
========================================================= */

async function notificationMutation(key, task) {
  if (notificationMutationPending.has(key)) {
    return notificationMutationPending.get(key);
  }

  const request = (async () => {
    try {
      return await task();
    } finally {
      notificationMutationPending.delete(key);
    }
  })();

  notificationMutationPending.set(key, request);

  return request;
}

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

export async function markStudentNotificationRead({
  uid,
  nid,
} = {}) {
  if (!validPositiveId(uid)) {
    return {
      status: false,
      message: "A valid student ID is required.",
    };
  }

  if (!validPositiveId(nid)) {
    return {
      status: false,
      message:
        "A valid notification ID is required.",
    };
  }

  return notificationMutation(
    `read:${uid}:${nid}`,
    async () => {
      try {
        const result = await postRequest({
          endpoint: "readNotification",
          fields: {
            uid: String(uid),
            nid: String(nid),
          },
          cache: "no-store",
        });

        const status = isPscSuccessStatus(
          result?.status
        );

        if (status) {
          clearStudentNotificationCache(
            String(uid)
          );
        }

        return {
          status,
          message:
            result?.msg ??
            result?.message ??
            "",
        };
      } catch (error) {
        console.error(
          "markStudentNotificationRead:",
          error
        );

        return notificationFailure(
          error,
          "Unable to mark notification as read."
        );
      }
    }
  );
}

/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

export async function markAllStudentNotificationsRead({
  uid,
  cid,
} = {}) {
  if (!validPositiveId(uid)) {
    return {
      status: false,
      message: "A valid student ID is required.",
    };
  }

  let courseId;

  try {
    courseId = requireCid(cid);
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }

  return notificationMutation(
    `all:${uid}:${courseId}`,
    async () => {
      try {
        const result = await postRequest({
          endpoint: "readAllNotification",
          fields: {
            uid: String(uid),
            cid: courseId,
          },
          cache: "no-store",
        });

        const status = isPscSuccessStatus(
          result?.status
        );

        if (status) {
          clearStudentNotificationCache(
            String(uid)
          );
        }

        return {
          status,
          message:
            result?.msg ??
            result?.message ??
            "",
        };
      } catch (error) {
        console.error(
          "markAllStudentNotificationsRead:",
          error
        );

        return notificationFailure(
          error,
          "Unable to mark notifications as read."
        );
      }
    }
  );
}


/* =========================================================
   USER TRANSACTIONS
========================================================= */

export async function getUserTransactions({
  uid,
} = {}) {
  try {
    if (!validPositiveId(uid)) {
      return {
        status: false,
        transactions: [],
        message:
          "A valid student ID is required.",
      };
    }

    const result = await postRequest({
      endpoint: "getTransactions",
      fields: {
        uid: String(uid),
      },
      cache: "no-store",
    });

    const transactions =
      Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.details)
          ? result.details
          : Array.isArray(result?.transactions)
            ? result.transactions
            : [];

    const status =
      isPscSuccessStatus(result?.status);

    if (!status) {
      console.warn(
        "Purchase history backend returned failure:",
        {
          status: result?.status,
          message:
            result?.message ??
            result?.msg ??
            "",
          dataCount:
            transactions.length,
        }
      );
    }

    return {
      status,
      transactions,
      message:
        result?.message ??
        result?.msg ??
        (status
          ? ""
          : "Purchase history is temporarily unavailable."),
    };
  } catch (error) {
    console.error(
      "getUserTransactions failed:",
      error
    );

    return {
      status: false,
      transactions: [],
      message:
        error?.message ||
        "Unable to load purchased packages.",
    };
  }
}

/* =========================================================
   USER TRANSACTION DETAILS
========================================================= */

export async function getUserTransactionDetails({
  uid,
  tid,
} = {}) {
  try {
    if (!validPositiveId(uid)) {
      return {
        status: false,
        transaction: null,
        message:
          "A valid student ID is required.",
      };
    }

    if (!validPositiveId(tid)) {
      return {
        status: false,
        transaction: null,
        message:
          "A valid transaction ID is required.",
      };
    }

    const result = await postRequest({
      endpoint: "getTransactionDetails",
      fields: {
        uid: String(uid),
        tid: String(tid),
      },
      cache: "no-store",
    });

    const raw =
      result?.data ??
      result?.details ??
      result?.transaction ??
      null;

    const transaction =
      Array.isArray(raw)
        ? raw[0] ?? null
        : raw;

    const status =
      isPscSuccessStatus(result?.status);

    return {
      status,
      transaction,
      message:
        result?.message ??
        result?.msg ??
        (status
          ? ""
          : "Transaction details are unavailable."),
    };
  } catch (error) {
    console.error(
      "getUserTransactionDetails failed:",
      error
    );

    return {
      status: false,
      transaction: null,
      message:
        error?.message ||
        "Unable to load transaction details.",
    };
  }
}


/* =========================================================
   EXAM SYLLABUS
========================================================= */

export async function getExamSyllabus({
  cid,
  uid = 0,
} = {}) {
  try {
    const safeCid = requireCid(cid);

    const result = await postRequest({
      endpoint: "getExamSyllabusCid",
      fields: {
        uid: String(uid ?? 0),
        cid: safeCid,
      },
      cache: "no-store",
    });

    return {
      status: result?.status !== false,
      filePath: String(
        result?.file_path ??
        result?.filePath ??
        ""
      ),
      syllabus: Array.isArray(result?.data)
        ? result.data
        : [],
      message: result?.message ?? "",
      raw: result,
    };
  } catch (error) {
    console.error("getExamSyllabus:", error);

    return {
      status: false,
      filePath: "",
      syllabus: [],
      message:
        error?.message ||
        "Unable to load syllabus.",
      raw: null,
    };
  }
}

/* =========================================================
   SLUG UTILITIES
========================================================= */

export {
  createSlug,
  normalizeCourseSlug,
};
