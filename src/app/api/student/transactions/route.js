
import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";

import {
  getUserTransactionDetails,
  getUserTransactions,
} from "@/lib/pscApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* =========================================================
   RESPONSE
========================================================= */

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "private, no-store, no-cache, must-revalidate",
    },
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
    result?.message ?? result?.msg;

  return typeof message === "string" &&
    message.trim()
    ? message.trim()
    : fallback;
}

/* =========================================================
   GET TRANSACTIONS
========================================================= */

export async function GET(request) {
  /* =======================================================
     AUTHENTICATE STUDENT
  ======================================================= */

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

  /* =======================================================
     VALIDATE TRANSACTION ID
  ======================================================= */

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
      },
      400
    );
  }

  /* =======================================================
     FETCH BACKEND DATA
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
    typeof result !== "object"
  ) {
    console.error(
      "Invalid transaction API response."
    );

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

  /* =======================================================
     TRANSACTION DETAILS
  ======================================================= */

  if (tid) {
    if (!isSuccess(result.status)) {
      return reply(
        {
          status: false,
          message: getMessage(
            result,
            "Unable to load transaction details."
          ),
          transaction: null,
        },
        502
      );
    }

    const transaction =
      result.transaction ?? null;

    if (
      !transaction ||
      typeof transaction !== "object" ||
      Array.isArray(transaction)
    ) {
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

    // The helper must retrieve the transaction
    // using the authenticated uid and requested tid.
    // Do not use this endpoint to grant premium access.

    return reply({
      status: true,
      transaction,
    });
  }

  /* =======================================================
     TRANSACTION LIST
  ======================================================= */

  if (!isSuccess(result.status)) {
    console.error(
      "Purchase history backend returned failure:",
      {
        status: result.status,
        message:
          result.message ??
          result.msg ??
          null,
      }
    );

    // Do not convert status:false into a successful
    // empty list. It could indicate a backend error.

    return reply(
      {
        status: false,
        message: getMessage(
          result,
          "Unable to load your purchases."
        ),
        data: [],
      },
      502
    );
  }

  if (!Array.isArray(result.transactions)) {
    console.error(
      "Purchase history response has no valid transactions array."
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

  /* =======================================================
     SUCCESS
  ======================================================= */

  return reply({
    status: true,
    data: result.transactions,
    count: result.transactions.length,
  });
}
