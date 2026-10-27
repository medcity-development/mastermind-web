import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  checkPackagePurchaseEligibility,
} from "@/lib/packagePurchaseEligibility";

import {
  getPaymentRecord,
  releasePayment,
} from "@/lib/paymentRecord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const id = Number(text);

  return Number.isSafeInteger(id)
    ? id
    : null;
}

async function getRazorpayOrder(orderId) {
  const keyId = String(
    process.env.RAZORPAY_KEY_ID ?? ""
  ).trim();

  const secret = String(
    process.env.RAZORPAY_KEY_SECRET ?? ""
  ).trim();

  if (!keyId || !secret) {
    throw new Error(
      "Razorpay credentials unavailable."
    );
  }

  const authorization = Buffer.from(
    `${keyId}:${secret}`
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Basic ${authorization}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to confirm Razorpay order."
    );
  }

  return response.json();
}

export async function GET(request) {
  let session;

  try {
    session = await getStudentSession();
  } catch {
    return reply(
      {
        status: false,
        state: "unknown",
        locked: true,
        message: "Unable to verify your session.",
      },
      503
    );
  }

  const uid = normalizeId(session?.uid);

  if (!uid || session?.stage !== "completed") {
    return reply(
      {
        status: false,
        state: "unknown",
        locked: true,
        message: "Please sign in to continue.",
      },
      401
    );
  }

  const params = new URL(request.url).searchParams;

  const cid = normalizeId(params.get("cid"));
  const pid = normalizeId(params.get("pid"));

  if (!cid || !pid) {
    return reply(
      {
        status: false,
        state: "unknown",
        locked: true,
        message: "Invalid package details.",
      },
      400
    );
  }

  try {
    // FIRST: Check the actual PSC subscription.
    const eligibility =
      await checkPackagePurchaseEligibility({
        uid,
        cid,
        pid,
      });

    if (eligibility.reason === "ALREADY_ACTIVE") {
      return reply({
        status: true,
        state: "activated",
        locked: true,
        purchased: true,
        paymentReceived: false,
        packageActivated: true,
        pid,
        cid,
        validUntil: eligibility.expiryDate,
        expiryDate: eligibility.expiryDate,
        message:
          "You have already purchased this package.",
      });
    }

    if (!eligibility.allowed) {
      return reply(
        {
          status: false,
          state: "unknown",
          locked: true,
          reason: eligibility.reason,
          message: eligibility.message,
        },
        503
      );
    }

    // SECOND: Check saved Razorpay payment tracking.
    const record = await getPaymentRecord(
      uid,
      cid,
      pid
    );

    if (!record) {
      return reply({
        status: true,
        state: "none",
        locked: false,
        purchased: false,
        packageActivated: false,
      });
    }

    if (record.state === "activated") {
      // Local activation was recorded, but PSC does not
      // currently confirm an active subscription.
      // Do not allow a new payment automatically.
      return reply({
        status: true,
        state: "unknown",
        locked: true,
        purchased: false,
        paymentReceived: true,
        packageActivated: false,
        message:
          "A previous package activation is recorded, but the current subscription could not be confirmed. Please contact support before paying again.",
      });
    }

    if (
      record.state === "checkout_created" &&
      Number.isFinite(Number(record.createdAt)) &&
      Date.now() - Number(record.createdAt) >
        30 * 60 * 1000 &&
      record.orderId
    ) {
      const order = await getRazorpayOrder(
        record.orderId
      );

      // Release only when Razorpay confirms no payment
      // was made against the order.
      if (
        order?.id === record.orderId &&
        order?.status === "created" &&
        Number(order?.amount_paid) === 0
      ) {
        await releasePayment(uid, cid, pid);

        return reply({
          status: true,
          state: "none",
          locked: false,
          purchased: false,
        });
      }
    }

    const state = String(
      record.state ?? "unknown"
    );

    const paymentReceived = [
      "captured_pending",
      "activated",
    ].includes(state);

    return reply({
      status: true,
      state,
      locked: true,
      purchased: false,
      paymentReceived,
      packageActivated: false,
      orderId: record.orderId ?? null,
      message:
        record.failureMessage || (state === "captured_pending"
          ? "Payment received. Package activation is pending. Do not pay again."
          : "An earlier checkout or payment requires verification before another payment."),
    });
  } catch (error) {
    console.error(
      "Package payment status failed:",
      error?.message
    );

    return reply(
      {
        status: false,
        state: "unknown",
        locked: true,
        purchased: false,
        message:
          "Unable to verify your previous payment or subscription. Checkout is temporarily disabled.",
      },
      503
    );
  }
}
