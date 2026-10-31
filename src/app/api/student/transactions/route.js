
import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserTransactionDetails,
  getUserTransactions,
} from "@/lib/pscApi";

import {
  getPscCooldownSeconds,
  setPscRateLimit,
} from "@/lib/pscRequestManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* =========================================================
   RESPONSE
========================================================= */

function reply(
  body,
  status = 200,
  retryAfter = null
) {
  const headers = {
    "Cache-Control":
      "private, no-store, no-cache, must-revalidate",
  };

  if (status === 429) {
    headers["Retry-After"] = String(
      retryAfter ?? 60
    );
  }

  return NextResponse.json(body, {
    status,
    headers,
  });
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const id = Number(text);

  return Number.isSafeInteger(id)
    ? String(id)
    : null;
}

function isSuccess(value) {
  return (
    value === true ||
    value === 1 ||
    ["true", "1"].includes(
      String(value ?? "")
        .trim()
        .toLowerCase()
    )
  );
}

function getMessage(result, fallback) {
  const message =
    result?.message ??
    result?.msg ??
    result?.raw?.message ??
    result?.raw?.msg;

  return typeof message === "string" &&
    message.trim()
    ? message.trim()
    : fallback;
}

function getTransactionsArray(result) {
  const candidates = [
    result?.transactions,
    result?.data,
    result?.raw?.data,
    result?.raw?.transactions,
  ];

  return candidates.find(Array.isArray) ?? null;
}

function getTransactionObject(result) {
  const candidates = [
    result?.transaction,
    result?.details,
    result?.data,
    result?.raw?.transaction,
    result?.raw?.details,
    result?.raw?.data,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate;
    }

    if (
      Array.isArray(candidate) &&
      candidate.length === 1 &&
      candidate[0] &&
      typeof candidate[0] === "object" &&
      !Array.isArray(candidate[0])
    ) {
      return candidate[0];
    }
  }

  return null;
}

function matchesTransactionId(
  transaction,
  tid
) {
  const transactionId =
    transaction?.id ??
    transaction?.tid ??
    transaction?.transaction_record_id;

  if (
    transactionId === undefined ||
    transactionId === null
  ) {
    return true;
  }

  return String(transactionId) === String(tid);
}

function matchesAuthenticatedUser(
  transaction,
  uid
) {
  const transactionUid =
    transaction?.uid ??
    transaction?.user_id ??
    transaction?.userId;

  if (
    transactionUid === undefined ||
    transactionUid === null
  ) {
    return true;
  }

  return String(transactionUid) === String(uid);
}

/* =========================================================
   RATE LIMIT HELPERS
========================================================= */

function isRateLimited(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const status = Number(
    value.httpStatus ??
    value.statusCode ??
    value.code
  );

  if (
    status === 429 ||
    value.rateLimited === true
  ) {
    return true;
  }

  const message = getMessage(
    value,
    value?.message ?? ""
  );

  return /too many attempts|too many requests|rate[\s-]?limit/i.test(
    String(message)
  );
}

function rateLimitResponse(
  source,
  tid = null
) {
  const providedRetry =
    source?.retryAfter ??
    source?.retry_after ??
    null;

  const retryAfter =
    providedRetry !== null
      ? setPscRateLimit(providedRetry)
      : getPscCooldownSeconds() ||
        setPscRateLimit();

  return reply(
    {
      status: false,
      message:
        "Purchase history is temporarily rate-limited. Please try again later.",
      rateLimited: true,
      retryAfter,
      ...(tid
        ? { transaction: null }
        : { data: [] }),
    },
    429,
    retryAfter
  );
}

/* =========================================================
   GET TRANSACTIONS
========================================================= */

export async function GET(request) {
  let session;

  try {
    session = await getStudentSession();
  } catch (error) {
    console.error(
      "Transaction session verification failed:",
      error?.message
    );

    return reply(
      {
        status: false,
        message:
          "Unable to verify your session.",
        data: [],
      },
      503
    );
  }

  const uid = normalizeId(session?.uid);

  if (!uid) {
    return reply(
      {
        status: false,
        message:
          "Please sign in to view your purchases.",
        data: [],
      },
      401
    );
  }

  const searchParams = new URL(
    request.url
  ).searchParams;

  const requestedTid =
    searchParams.get("tid");

  const tid =
    requestedTid === null
      ? null
      : normalizeId(requestedTid);

  if (requestedTid !== null && !tid) {
    return reply(
      {
        status: false,
        message:
          "A valid transaction ID is required.",
        transaction: null,
      },
      400
    );
  }

  /* =======================================================
     FETCH PSC BACKEND
  ======================================================= */

  let result;

  try {
    result = tid
      ? await getUserTransactionDetails({
          uid,
          tid,
        })
      : await getUserTransactions({
          uid,
        });
  } catch (error) {
    if (isRateLimited(error)) {
      return rateLimitResponse(error, tid);
    }

    console.error(
      "Student transaction backend request failed:",
      {
        type: tid ? "details" : "list",
        message:
          error?.message ??
          "Unknown backend error",
      }
    );

    return reply(
      {
        status: false,
        message:
          "Unable to connect to the purchase history service.",
        ...(tid
          ? { transaction: null }
          : { data: [] }),
      },
      502
    );
  }

  /* =======================================================
     VALIDATE RESPONSE
  ======================================================= */

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    return reply(
      {
        status: false,
        message:
          "The purchase history service returned an invalid response.",
        ...(tid
          ? { transaction: null }
          : { data: [] }),
      },
      502
    );
  }

  if (
    isRateLimited(result) ||
    isRateLimited(result.raw)
  ) {
    return rateLimitResponse(
      isRateLimited(result)
        ? result
        : result.raw,
      tid
    );
  }

  const responseStatus =
    result.status ??
    result.raw?.status;

  if (!isSuccess(responseStatus)) {
    console.error(
      "Purchase history backend returned failure:",
      {
        type: tid ? "details" : "list",
        status: responseStatus,
        message: getMessage(
          result,
          "Backend reported failure."
        ),
      }
    );

    return reply(
      {
        status: false,
        message: getMessage(
          result,
          tid
            ? "Unable to load transaction details."
            : "Unable to load your purchases."
        ),
        ...(tid
          ? { transaction: null }
          : { data: [] }),
      },
      502
    );
  }

  /* =======================================================
     TRANSACTION DETAILS
  ======================================================= */

  if (tid) {
    const transaction =
      getTransactionObject(result);

    if (!transaction) {
      return reply(
        {
          status: false,
          message:
            "Transaction details are unavailable.",
          transaction: null,
        },
        502
      );
    }

    if (
      !matchesTransactionId(
        transaction,
        tid
      ) ||
      !matchesAuthenticatedUser(
        transaction,
        uid
      )
    ) {
      return reply(
        {
          status: false,
          message:
            "The requested transaction could not be verified.",
          transaction: null,
        },
        502
      );
    }

    return reply({
      status: true,
      transaction,
    });
  }

  /* =======================================================
     TRANSACTION LIST
  ======================================================= */

  const transactions =
    getTransactionsArray(result);

  if (!transactions) {
    console.error(
      "Purchase history response has no valid transaction array."
    );

    return reply(
      {
        status: false,
        message:
          "The purchase history service returned invalid transaction data.",
        data: [],
      },
      502
    );
  }

  const ownedTransactions =
    transactions.filter((transaction) => {
      return (
        transaction &&
        typeof transaction === "object" &&
        !Array.isArray(transaction) &&
        matchesAuthenticatedUser(
          transaction,
          uid
        )
      );
    });

  return reply({
    status: true,
    data: ownedTransactions,
    count: ownedTransactions.length,
  });
}
