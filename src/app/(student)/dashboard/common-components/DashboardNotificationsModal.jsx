
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

/* =========================================================
   SHARED REQUEST CACHE
========================================================= */

const CACHE_TTL = 15_000;
const DEFAULT_COOLDOWN = 60_000;

const notificationCache = new Map();
const pendingRequests = new Map();
const cooldowns = new Map();

function isNotificationRead(notification) {
  return (
    String(notification?.nstatus ?? "")
      .trim()
      .toLowerCase() === "read"
  );
}

function countUnread(items) {
  return items.filter(
    (item) => !isNotificationRead(item)
  ).length;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getCachedNotifications(slug) {
  const entry = notificationCache.get(slug);

  if (!entry) return null;

  return entry;
}

function saveNotifications(slug, items) {
  notificationCache.set(slug, {
    data: items,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

function invalidateNotifications(slug) {
  notificationCache.delete(slug);
}

function getCooldownSeconds(slug) {
  const until = cooldowns.get(slug) ?? 0;

  return Math.max(
    0,
    Math.ceil((until - Date.now()) / 1000)
  );
}

function createRequestError(
  message,
  status,
  retryAfter
) {
  const error = new Error(message);

  error.status = status;
  error.retryAfter = retryAfter;

  return error;
}

function getRetryAfter(response, result) {
  const header = response.headers.get(
    "retry-after"
  );

  const bodySeconds = Number(
    result?.retryAfter
  );

  if (
    Number.isFinite(bodySeconds) &&
    bodySeconds > 0
  ) {
    return Math.ceil(bodySeconds);
  }

  if (header) {
    const seconds = Number(header);

    if (
      Number.isFinite(seconds) &&
      seconds >= 0
    ) {
      return Math.max(1, Math.ceil(seconds));
    }

    const date = Date.parse(header);

    if (Number.isFinite(date)) {
      return Math.max(
        1,
        Math.ceil(
          (date - Date.now()) / 1000
        )
      );
    }
  }

  return DEFAULT_COOLDOWN / 1000;
}

/* =========================================================
   FETCH NOTIFICATIONS
========================================================= */

async function fetchNotifications(
  slug,
  { force = false } = {}
) {
  if (!slug) {
    throw new Error(
      "A valid dashboard course is required."
    );
  }

  const remaining = getCooldownSeconds(slug);

  if (remaining > 0) {
    throw createRequestError(
      "Notifications are temporarily rate-limited.",
      429,
      remaining
    );
  }

  const cached = getCachedNotifications(slug);

  if (
    !force &&
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.data;
  }

  const pending = pendingRequests.get(slug);

  if (pending) {
    return pending;
  }

  const request = (async () => {
    const response = await fetch(
      `/api/student/notifications?slug=${encodeURIComponent(
        slug
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    let result = null;

    try {
      result = await response.json();
    } catch {
      throw createRequestError(
        "The notification server returned an invalid response.",
        response.status,
        0
      );
    }

    if (response.status === 429) {
      const retryAfter = getRetryAfter(
        response,
        result
      );

      cooldowns.set(
        slug,
        Date.now() + retryAfter * 1000
      );

      throw createRequestError(
        result?.message ||
          "Notifications are temporarily rate-limited.",
        429,
        retryAfter
      );
    }

    if (
      !response.ok ||
      result?.status !== true
    ) {
      throw createRequestError(
        result?.message ||
          "Unable to load notifications.",
        response.status,
        0
      );
    }

    const items = Array.isArray(result.data)
      ? result.data
      : [];

    saveNotifications(slug, items);
    cooldowns.delete(slug);

    return items;
  })();

  pendingRequests.set(slug, request);

  try {
    return await request;
  } finally {
    if (pendingRequests.get(slug) === request) {
      pendingRequests.delete(slug);
    }
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DashboardNotificationsModal({
  slug,
  onClose,
  onUnreadCountChange,
}) {
  const normalizedSlug = String(
    slug ?? ""
  ).trim();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [cooldownSeconds, setCooldownSeconds] =
    useState(0);

  const mountedRef = useRef(false);
  const loadIdRef = useRef(0);
  const closeRef = useRef(onClose);
  const unreadCallbackRef = useRef(
    onUnreadCountChange
  );

  const unreadCount = countUnread(
    notifications
  );

  /* -------------------------------------------------------
     KEEP CALLBACK REFERENCES CURRENT

     Do not add parent callbacks to the fetch effect.
  ------------------------------------------------------- */

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    unreadCallbackRef.current =
      onUnreadCountChange;
  }, [onUnreadCountChange]);

  const publishUnreadCount = useCallback(
    (items) => {
      unreadCallbackRef.current?.(
        countUnread(items)
      );
    },
    []
  );

  /* -------------------------------------------------------
     LOAD NOTIFICATIONS
  ------------------------------------------------------- */

  const loadNotifications = useCallback(
    async ({ force = false } = {}) => {
      if (!normalizedSlug) {
        setLoading(false);
        setError(
          "A valid dashboard course is required."
        );
        return;
      }

      const remaining =
        getCooldownSeconds(normalizedSlug);

      if (remaining > 0) {
        setCooldownSeconds(remaining);

        const cached =
          getCachedNotifications(
            normalizedSlug
          );

        if (cached) {
          setNotifications(cached.data);
          publishUnreadCount(cached.data);
          setError("");
        } else {
          setError(
            "Notifications are temporarily rate-limited."
          );
        }

        setLoading(false);
        return;
      }

      const requestId = ++loadIdRef.current;

      setLoading(true);
      setError("");

      try {
        const items = await fetchNotifications(
          normalizedSlug,
          { force }
        );

        if (
          !mountedRef.current ||
          requestId !== loadIdRef.current
        ) {
          return;
        }

        setNotifications(items);
        publishUnreadCount(items);

        setCooldownSeconds(0);
        setError("");
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== loadIdRef.current
        ) {
          return;
        }

        const remainingSeconds =
          getCooldownSeconds(
            normalizedSlug
          );

        setCooldownSeconds(
          remainingSeconds
        );

        const cached =
          getCachedNotifications(
            normalizedSlug
          );

        if (cached) {
          setNotifications(cached.data);
          publishUnreadCount(cached.data);
          setError("");
        } else {
          setError(
            loadError?.message ||
              "Unable to load notifications."
          );
        }

        if (loadError?.status !== 429) {
          console.error(
            "Dashboard notifications:",
            loadError
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === loadIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [normalizedSlug, publishUnreadCount]
  );

  /* -------------------------------------------------------
     INITIAL LOAD

     Runs when the course slug changes.
     Parent callback identity does not trigger refetching.
  ------------------------------------------------------- */

  useEffect(() => {
    mountedRef.current = true;

    const cached =
      getCachedNotifications(
        normalizedSlug
      );

    if (cached) {
      setNotifications(cached.data);
      publishUnreadCount(cached.data);
    } else {
      setNotifications([]);
    }

    loadNotifications();

    return () => {
      mountedRef.current = false;
      loadIdRef.current += 1;
    };
  }, [
    normalizedSlug,
    loadNotifications,
    publishUnreadCount,
  ]);

  /* -------------------------------------------------------
     COOLDOWN COUNTDOWN

     This timer updates the UI only.
     It does not send API requests.
  ------------------------------------------------------- */

  useEffect(() => {
    if (!cooldownSeconds) return;

    const interval = setInterval(() => {
      setCooldownSeconds(
        getCooldownSeconds(normalizedSlug)
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    cooldownSeconds > 0,
    normalizedSlug,
  ]);

  /* -------------------------------------------------------
     ESCAPE KEY
  ------------------------------------------------------- */

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeRef.current?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* -------------------------------------------------------
     MARK ONE AS READ
  ------------------------------------------------------- */

  async function markNotificationRead(
    notification
  ) {
    const nid = String(
      notification?.id ?? ""
    );

    if (
      !/^[1-9]\d*$/.test(nid) ||
      isNotificationRead(notification) ||
      updatingId ||
      markingAll
    ) {
      return;
    }

    setUpdatingId(nid);
    setActionError("");

    try {
      const response = await fetch(
        "/api/student/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "read",
            nid,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result?.status !== true
      ) {
        throw new Error(
          result?.message ||
            "Unable to mark notification as read."
        );
      }

      const updated = notifications.map(
        (item) =>
          String(item.id) === nid
            ? {
                ...item,
                nstatus: "read",
              }
            : item
      );

      setNotifications(updated);
      publishUnreadCount(updated);

      saveNotifications(
        normalizedSlug,
        updated
      );
    } catch (updateError) {
      console.error(
        "Mark notification read:",
        updateError
      );

      setActionError(
        updateError?.message ||
          "Unable to update notification."
      );
    } finally {
      setUpdatingId("");
    }
  }

  /* -------------------------------------------------------
     MARK ALL AS READ
  ------------------------------------------------------- */

  async function markAllRead() {
    if (
      !unreadCount ||
      markingAll ||
      updatingId
    ) {
      return;
    }

    setMarkingAll(true);
    setActionError("");

    try {
      const response = await fetch(
        "/api/student/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "read-all",
            slug: normalizedSlug,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        result?.status !== true
      ) {
        throw new Error(
          result?.message ||
            "Unable to mark notifications as read."
        );
      }

      const updated = notifications.map(
        (item) => ({
          ...item,
          nstatus: "read",
        })
      );

      setNotifications(updated);
      publishUnreadCount(updated);

      saveNotifications(
        normalizedSlug,
        updated
      );
    } catch (updateError) {
      console.error(
        "Mark all notifications read:",
        updateError
      );

      setActionError(
        updateError?.message ||
          "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  const hasCooldown =
    cooldownSeconds > 0;

  const hasNotifications =
    notifications.length > 0;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/35 p-3 pt-20 backdrop-blur-sm sm:justify-end sm:px-6 sm:pt-24"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeRef.current?.();
        }
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="dashboard-notifications-title"
        role="dialog"
        className="flex max-h-[min(720px,82vh)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
      >
        {/* HEADER */}

        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Bell size={18} />
            </span>

            <div>
              <h2
                id="dashboard-notifications-title"
                className="text-sm font-black text-slate-900"
              >
                Notifications
              </h2>

              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                {unreadCount
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                loadNotifications({
                  force: true,
                })
              }
              disabled={
                loading ||
                hasCooldown
              }
              aria-label="Refresh notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              onClick={() =>
                closeRef.current?.()
              }
              aria-label="Close notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* MARK ALL AS READ */}

        {unreadCount > 0 ? (
          <div className="flex justify-end border-b border-slate-100 px-5 py-2.5">
            <button
              type="button"
              onClick={markAllRead}
              disabled={
                markingAll ||
                Boolean(updatingId)
              }
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={14} />
              )}

              Mark all as read
            </button>
          </div>
        ) : null}

        {/* ACTION ERROR */}

        {actionError ? (
          <p
            role="alert"
            className="border-b border-rose-100 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-700"
          >
            {actionError}
          </p>
        ) : null}

        {/* RATE LIMIT NOTICE */}

        {hasCooldown &&
        hasNotifications ? (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-2.5">
            <p className="text-xs font-medium text-amber-800">
              Showing saved notifications.
              Refresh available in{" "}
              {cooldownSeconds}s.
            </p>
          </div>
        ) : null}

        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading &&
          !hasNotifications ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2
                size={17}
                className="animate-spin"
              />
              Loading notifications...
            </div>
          ) : error &&
          !hasNotifications ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p
                role="alert"
                className="text-sm font-semibold text-rose-700"
              >
                {error}
              </p>

              {hasCooldown ? (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  You can retry in{" "}
                  {cooldownSeconds} seconds.
                </p>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  loadNotifications({
                    force: true,
                  })
                }
                disabled={
                  loading ||
                  hasCooldown
                }
                className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasCooldown
                  ? `Retry in ${cooldownSeconds}s`
                  : "Try again"}
              </button>
            </div>
          ) : hasNotifications ? (
            <ul className="space-y-2">
              {notifications.map(
                (
                  notification,
                  index
                ) => {
                  const read =
                    isNotificationRead(
                      notification
                    );

                  const id = String(
                    notification?.id ??
                      index
                  );

                  const title = String(
                    notification?.title ||
                      "Notification"
                  );

                  const message = String(
                    notification?.message ||
                      ""
                  );

                  const image = String(
                    notification?.image ||
                      ""
                  ).trim();

                  const safeImage =
                    image.replace(
                      /["\\]/g,
                      ""
                    );

                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() =>
                          markNotificationRead(
                            notification
                          )
                        }
                        disabled={
                          read ||
                          Boolean(
                            updatingId
                          ) ||
                          markingAll
                        }
                        className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                          read
                            ? "border-slate-100 bg-white"
                            : "border-blue-100 bg-blue-50/60 hover:bg-blue-50"
                        } disabled:cursor-default`}
                      >
                        {image ? (
                          <span
                            aria-hidden="true"
                            className="h-10 w-10 shrink-0 rounded-xl border border-slate-100 bg-cover bg-center bg-no-repeat"
                            style={{
                              backgroundImage:
                                `url("${safeImage}")`,
                            }}
                          />
                        ) : (
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              read
                                ? "bg-slate-200"
                                : "bg-blue-600"
                            }`}
                          />
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span
                              className={`text-xs font-extrabold ${
                                read
                                  ? "text-slate-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {title}
                            </span>

                            {updatingId ===
                            id ? (
                              <Loader2
                                size={14}
                                className="shrink-0 animate-spin text-blue-700"
                              />
                            ) : !read ? (
                              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[9px] font-extrabold text-blue-700">
                                New
                              </span>
                            ) : null}
                          </span>

                          {message ? (
                            <span className="mt-1.5 block text-[11px] leading-5 text-slate-600">
                              {message}
                            </span>
                          ) : null}

                          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                            {notification?.type ? (
                              <span>
                                {
                                  notification.type
                                }
                              </span>
                            ) : null}

                            {notification?.created_at ? (
                              <time
                                dateTime={
                                  notification.created_at
                                }
                              >
                                {formatDate(
                                  notification.created_at
                                )}
                              </time>
                            ) : null}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                }
              )}
            </ul>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-5 text-center">
              <Bell
                size={27}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-700">
                No notifications
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your updates will appear
                here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
