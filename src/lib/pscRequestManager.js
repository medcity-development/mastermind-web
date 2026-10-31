
import "server-only";

const DEFAULT_INTERVAL_MS = 1500;
const DEFAULT_COOLDOWN_MS = 60_000;
const DEFAULT_MAX_QUEUE_WAIT_MS = 15_000;

function positiveInteger(value, fallback) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : fallback;
}

const MIN_INTERVAL_MS = positiveInteger(
  process.env.PSC_REQUEST_INTERVAL_MS,
  DEFAULT_INTERVAL_MS
);

const MAX_QUEUE_WAIT_MS = positiveInteger(
  process.env.PSC_MAX_QUEUE_WAIT_MS,
  DEFAULT_MAX_QUEUE_WAIT_MS
);

const DEBUG =
  process.env.PSC_REQUEST_DEBUG === "true";

const STATE_KEY = Symbol.for(
  "mastermind.psc.requests"
);

const state = (globalThis[STATE_KEY] ??= {
  nextRequestAt: 0,
  cooldownUntil: 0,
  queue: Promise.resolve(),
  pending: new Map(),
});

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function parseRetryAfter(value) {
  if (value == null || String(value).trim() === "") {
    return DEFAULT_COOLDOWN_MS;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(1000, seconds * 1000);
  }

  const date = Date.parse(String(value));

  if (Number.isFinite(date)) {
    return Math.max(1000, date - Date.now());
  }

  return DEFAULT_COOLDOWN_MS;
}

export function getPscCooldownSeconds() {
  return Math.max(
    0,
    Math.ceil(
      (state.cooldownUntil - Date.now()) / 1000
    )
  );
}

export function isPscRateLimited() {
  return Date.now() < state.cooldownUntil;
}

export function setPscRateLimit(retryAfter = null) {
  state.cooldownUntil = Math.max(
    state.cooldownUntil,
    Date.now() + parseRetryAfter(retryAfter)
  );

  return getPscCooldownSeconds();
}

function createRateLimitError() {
  const error = new Error(
    "PSC backend is temporarily rate-limited."
  );

  error.name = "PscRateLimitError";
  error.status = 429;
  error.httpStatus = 429;
  error.retryAfter = getPscCooldownSeconds();

  return error;
}

function createQueueTimeoutError() {
  const error = new Error(
    "PSC request waited too long in the queue."
  );

  error.name = "PscQueueTimeoutError";
  error.status = 503;
  error.httpStatus = 503;

  return error;
}

function createAbortError() {
  const error = new Error(
    "PSC request was aborted."
  );

  error.name = "AbortError";
  return error;
}

function checkAbort(signal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

/**
 * Reserve a request-start slot.
 *
 * Requests are spaced apart, but network
 * operations may run concurrently.
 *
 * A queued request is rejected if its
 * waiting time exceeds the configured limit.
 */
function reserveRequestSlot(signal) {
  const queuedAt = Date.now();

  const reservation = state.queue
    .catch(() => undefined)
    .then(async () => {
      checkAbort(signal);

      if (isPscRateLimited()) {
        throw createRateLimitError();
      }

      const elapsed = Date.now() - queuedAt;

      if (elapsed >= MAX_QUEUE_WAIT_MS) {
        throw createQueueTimeoutError();
      }

      const wait = Math.max(
        0,
        state.nextRequestAt - Date.now()
      );

      if (elapsed + wait > MAX_QUEUE_WAIT_MS) {
        throw createQueueTimeoutError();
      }

      if (wait > 0) {
        await sleep(wait);
      }

      checkAbort(signal);

      if (
        Date.now() - queuedAt >
        MAX_QUEUE_WAIT_MS
      ) {
        throw createQueueTimeoutError();
      }

      if (isPscRateLimited()) {
        throw createRateLimitError();
      }

      state.nextRequestAt =
        Date.now() + MIN_INTERVAL_MS;

      return Date.now() - queuedAt;
    });

  state.queue = reservation.then(
    () => undefined,
    () => undefined
  );

  return reservation;
}

/**
 * Deduplicate identical in-flight
 * upstream requests.
 *
 * Every caller receives its own
 * Response clone.
 */
export async function executePscRequest({
  key,
  task,
  signal,
} = {}) {
  if (typeof key !== "string" || !key.trim()) {
    throw new Error(
      "PSC request key is required."
    );
  }

  if (typeof task !== "function") {
    throw new Error(
      "PSC request task is required."
    );
  }

  checkAbort(signal);

  const existing = state.pending.get(key);

  if (existing) {
    if (DEBUG) {
      console.info(
        "[PSC] Reusing pending request:",
        key
      );
    }

    const response = await existing;

    checkAbort(signal);

    return response.clone();
  }

  if (isPscRateLimited()) {
    throw createRateLimitError();
  }

  const startedAt = Date.now();

  const promise = (async () => {
    const queueWaitMs =
      await reserveRequestSlot(signal);

    checkAbort(signal);

    if (isPscRateLimited()) {
      throw createRateLimitError();
    }

    const networkStartedAt = Date.now();

    const response = await task();

    if (
      !response ||
      typeof response.status !== "number" ||
      typeof response.clone !== "function"
    ) {
      throw new Error(
        "PSC task must return a Response object."
      );
    }

    if (response.status === 429) {
      setPscRateLimit(
        response.headers.get("Retry-After")
      );

      throw createRateLimitError();
    }

    if (DEBUG) {
      console.info("[PSC] Request completed", {
        key,
        status: response.status,
        queueWaitMs,
        networkMs:
          Date.now() - networkStartedAt,
        totalMs:
          Date.now() - startedAt,
      });
    }

    return response;
  })();

  state.pending.set(key, promise);

  try {
    const response = await promise;

    checkAbort(signal);

    return response.clone();
  } finally {
    if (state.pending.get(key) === promise) {
      state.pending.delete(key);
    }
  }
}
