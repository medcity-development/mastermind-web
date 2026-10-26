import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";

import { getGovernmentExamConfig } from "@/lib/governmentExamConfig";

import {
  getStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
} from "@/lib/pscApi";

export const dynamic = "force-dynamic";

/* =========================================================
   CACHE CONFIGURATION
========================================================= */

const CACHE_TTL = 15 * 1000;
const RATE_LIMIT_COOLDOWN = 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

const notificationCache = new Map();
const pendingRequests = new Map();
const cooldowns = new Map();

/* =========================================================
   RESPONSE
========================================================= */

function reply(body, status = 200, extraHeaders = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      ...extraHeaders,
    },
  });
}

/* =========================================================
   AUTHENTICATION
========================================================= */

async function getAuthenticatedStudent() {
  const session = await getStudentSession();

  const uid = String(session?.uid ?? "");

  if (
    !/^[1-9]\d*$/.test(uid) ||
    session?.stage !== "completed"
  ) {
    return null;
  }

  return { uid };
}

/* =========================================================
   COURSE CONFIG
========================================================= */

function getCourseConfig(slug) {
  const config = getGovernmentExamConfig(slug);

  const cid = Number(config?.cid);

  return Number.isSafeInteger(cid) && cid > 0
    ? { ...config, cid }
    : null;
}

/* =========================================================
   CACHE HELPERS
========================================================= */

function cacheKey(uid, cid) {
  return `${uid}:${cid}`;
}

function pruneCache() {
  const now = Date.now();

  for (const [key, entry] of notificationCache) {
    if (entry.expiresAt <= now) {
      notificationCache.delete(key);
    }
  }

  for (const [key, expiresAt] of cooldowns) {
    if (expiresAt <= now) {
      cooldowns.delete(key);
    }
  }

  while (notificationCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = notificationCache.keys().next().value;

    notificationCache.delete(oldestKey);
  }
}

function invalidateUserCache(uid) {
  for (const key of notificationCache.keys()) {
    if (key.startsWith(`${uid}:`)) {
      notificationCache.delete(key);
    }
  }
}

function getRemainingCooldown(key) {
  const expiresAt = cooldowns.get(key);

  if (!expiresAt) {
    return 0;
  }

  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    cooldowns.delete(key);
    return 0;
  }

  return Math.ceil(remaining / 1000);
}

/* =========================================================
   ERROR HELPERS
========================================================= */

function getErrorStatus(result) {
  const status = Number(
    result?.httpStatus ??
    result?.statusCode ??
    result?.errorStatus ??
    0
  );

  if (status === 429) {
    return 429;
  }

  if (status >= 400 && status <= 599) {
    return status;
  }

  const message = String(result?.message ?? "");

  if (
    /too many attempts|too many requests|rate limit/i.test(
      message
    )
  ) {
    return 429;
  }

  return 502;
}

function getRetryAfter(result) {
  const value = Number(result?.retryAfter);

  if (Number.isFinite(value) && value > 0) {
    return Math.min(Math.ceil(value), 3600);
  }

  return Math.ceil(RATE_LIMIT_COOLDOWN / 1000);
}

function failureResponse(result, fallbackMessage) {
  const status = getErrorStatus(result);

  if (status === 429) {
    const retryAfter = getRetryAfter(result);

    return reply(
      {
        status: false,
        message:
          "Too many requests. Please try again shortly.",
        retryAfter,
      },
      429,
      {
        "Retry-After": String(retryAfter),
      }
    );
  }

  return reply(
    {
      status: false,
      message: result?.message || fallbackMessage,
    },
    status
  );
}

/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export async function GET(request) {
  try {
    const student = await getAuthenticatedStudent();

    if (!student) {
      return reply(
        {
          status: false,
          message: "Please sign in to view notifications.",
        },
        401
      );
    }

    const slug = new URL(request.url).searchParams.get("slug");

    const config = getCourseConfig(slug);

    if (!config) {
      return reply(
        {
          status: false,
          message: "A valid dashboard course is required.",
        },
        400
      );
    }

    const key = cacheKey(student.uid, config.cid);

    pruneCache();

    /* -----------------------------------------------------
       RETURN CACHED NOTIFICATIONS
    ----------------------------------------------------- */

    const cached = notificationCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return reply({
        status: true,
        data: cached.data,
      });
    }

    /* -----------------------------------------------------
       RATE LIMIT COOLDOWN
    ----------------------------------------------------- */

    const remaining = getRemainingCooldown(key);

    if (remaining > 0) {
      return reply(
        {
          status: false,
          message:
            "Notifications are temporarily rate-limited.",
          retryAfter: remaining,
        },
        429,
        {
          "Retry-After": String(remaining),
        }
      );
    }

    /* -----------------------------------------------------
       PREVENT DUPLICATE REQUESTS
    ----------------------------------------------------- */

    let pending = pendingRequests.get(key);

    if (!pending) {
      pending = getStudentNotifications({
        uid: student.uid,
        cid: config.cid,
      });

      pendingRequests.set(key, pending);
    }

    let result;

    try {
      result = await pending;
    } finally {
      if (pendingRequests.get(key) === pending) {
        pendingRequests.delete(key);
      }
    }

    /* -----------------------------------------------------
       HANDLE FAILURE
    ----------------------------------------------------- */

    if (!result?.status) {
      const status = getErrorStatus(result);

      if (status === 429) {
        const retryAfter = getRetryAfter(result);

        cooldowns.set(
          key,
          Date.now() + retryAfter * 1000
        );
      }

      return failureResponse(
        result,
        "Unable to load notifications."
      );
    }

    /* -----------------------------------------------------
       SAVE SUCCESSFUL RESPONSE
    ----------------------------------------------------- */

    const notifications = Array.isArray(result.notifications)
      ? result.notifications
      : [];

    notificationCache.set(key, {
      data: notifications,
      expiresAt: Date.now() + CACHE_TTL,
    });

    pruneCache();

    return reply({
      status: true,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "GET /api/student/notifications failed:",
      error
    );

    return reply(
      {
        status: false,
        message: "Unable to load notifications.",
      },
      500
    );
  }
}

/* =========================================================
   UPDATE NOTIFICATIONS
========================================================= */

export async function POST(request) {
  try {
    const student = await getAuthenticatedStudent();

    if (!student) {
      return reply(
        {
          status: false,
          message: "Please sign in to update notifications.",
        },
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return reply(
        {
          status: false,
          message: "Invalid notification request.",
        },
        400
      );
    }

    const action = String(body?.action ?? "").trim();

    let result;

    if (action === "read") {
      const nid = String(body?.nid ?? "");

      if (!/^[1-9]\d*$/.test(nid)) {
        return reply(
          {
            status: false,
            message: "A valid notification ID is required.",
          },
          400
        );
      }

      result = await markStudentNotificationRead({
        uid: student.uid,
        nid,
      });
    } else if (action === "read-all") {
      const config = getCourseConfig(body?.slug);

      if (!config) {
        return reply(
          {
            status: false,
            message: "A valid dashboard course is required.",
          },
          400
        );
      }

      result = await markAllStudentNotificationsRead({
        uid: student.uid,
        cid: config.cid,
      });
    } else {
      return reply(
        {
          status: false,
          message: "Unsupported notification action.",
        },
        400
      );
    }

    if (!result?.status) {
      return failureResponse(
        result,
        "Unable to update notification status."
      );
    }

    invalidateUserCache(student.uid);

    return reply({
      status: true,
      message:
        result.message || "Notification status updated.",
    });
  } catch (error) {
    console.error(
      "POST /api/student/notifications failed:",
      error
    );

    return reply(
      {
        status: false,
        message: "Unable to update notifications.",
      },
      500
    );
  }
}