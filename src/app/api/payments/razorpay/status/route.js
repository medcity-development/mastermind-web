import { NextResponse } from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  checkPackagePurchaseEligibility,
} from "@/lib/packagePurchaseEligibility";

import {
  getPaymentRecord,
} from "@/lib/paymentRecord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return Number.isSafeInteger(id) ? id : null;
}

function lockedResponse({
  state = "unknown",
  message,
  orderId = null,
  paymentReceived = false,
  reason = null,
}) {
  return {
    status: true,
    state,
    locked: true,
    purchased: false,
    paymentReceived,
    packageActivated: false,
    orderId,
    reason,
    message,
  };
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
      "Razorpay credentials are missing."
    );
  }

  const authorization = Buffer.from(
    `${keyId}:${secret}`
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(
      orderId
    )}`,
    {
      method: "GET",
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
      "Unable to retrieve the Razorpay order."
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

  const params = new URL(
    request.url
  ).searchParams;

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
    // The PSC subscription is the source of truth
    // for whether this user already owns the package.
    const eligibility =
      await checkPackagePurchaseEligibility({
        uid,
        cid,
        pid,
      });

    if (eligibility?.reason === "ALREADY_ACTIVE") {
      return reply({
        status: true,
        state: "activated",
        locked: true,
        purchased: true,
        paymentReceived: true,
        packageActivated: true,
        cid,
        pid,
        validUntil:
          eligibility?.expiryDate ?? null,
        expiryDate:
          eligibility?.expiryDate ?? null,
        message:
          "You have already purchased this package.",
      });
    }

    if (!eligibility?.allowed) {
      return reply(
        {
          status: false,
          state: "unknown",
          locked: true,
          purchased: false,
          paymentReceived: false,
          packageActivated: false,
          reason:
            eligibility?.reason ??
            "OWNERSHIP_VERIFICATION_FAILED",
          message:
            eligibility?.message ??
            "Unable to verify package ownership.",
        },
        503
      );
    }

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
        paymentReceived: false,
        packageActivated: false,
        message: "Package is available for purchase.",
      });
    }

    const state = String(
      record?.state ?? "unknown"
    ).trim();

    const orderId = String(
      record?.orderId ?? ""
    ).trim();

    if (state === "activated") {
      return reply(
        lockedResponse({
          state: "unknown",
          paymentReceived: true,
          orderId: orderId || null,
          reason: "ACTIVATION_NOT_CONFIRMED",
          message:
            "A previous activation was recorded, but the PSC subscription is not currently confirmed. Please contact support before paying again.",
        })
      );
    }

    if (state === "captured_pending") {
      return reply(
        lockedResponse({
          state,
          paymentReceived: true,
          orderId: orderId || null,
          reason: "ACTIVATION_PENDING",
          message:
            record?.failureMessage ||
            "Payment received. Package activation is pending. Do not pay again.",
        })
      );
    }

    if (state === "creating") {
      return reply(
        lockedResponse({
          state: "creating",
          orderId: orderId || null,
          reason: "ORDER_CREATION_UNCONFIRMED",
          message:
            "A previous payment initiation is not yet confirmed. The system must verify whether the PSC backend created an order before another checkout can begin.",
        })
      );
    }

    if (state === "unknown") {
      return reply(
        lockedResponse({
          state: "unknown",
          orderId: orderId || null,
          reason: "PAYMENT_STATUS_UNKNOWN",
          message:
            record?.failureMessage ||
            "An earlier payment attempt requires verification. Do not pay again.",
        })
      );
    }

    if (state === "checkout_created") {
      if (!orderId) {
        return reply(
          lockedResponse({
            state: "unknown",
            reason: "ORDER_ID_MISSING",
            message:
              "A checkout was recorded without a Razorpay order ID. Contact support before retrying.",
          })
        );
      }

      let order;

      try {
        order = await getRazorpayOrder(orderId);
      } catch (error) {
        console.error(
          "Razorpay order status error:",
          error?.message
        );

        return reply(
          lockedResponse({
            state: "unknown",
            orderId,
            reason: "RAZORPAY_STATUS_UNAVAILABLE",
            message:
              "Unable to verify the previous Razorpay order. Please try refreshing the payment status later.",
          })
        );
      }

      if (order?.id !== orderId) {
        return reply(
          lockedResponse({
            state: "unknown",
            orderId,
            reason: "ORDER_MISMATCH",
            message:
              "The previous Razorpay order could not be matched.",
          })
        );
      }

      const amountPaid = Number(
        order?.amount_paid ?? 0
      );

      if (
        order?.status === "paid" ||
        amountPaid > 0
      ) {
        return reply(
          lockedResponse({
            state: "captured_pending",
            orderId,
            paymentReceived: true,
            reason: "PAYMENT_REQUIRES_RECONCILIATION",
            message:
              "Razorpay reports a payment against this order. Package activation must be reconciled before another payment.",
          })
        );
      }

      return reply(
        lockedResponse({
          state: "checkout_created",
          orderId,
          reason: "CHECKOUT_PENDING",
          message:
            "A previous Razorpay checkout exists. Its payment status must be resolved before creating another order.",
        })
      );
    }

    return reply(
      lockedResponse({
        state: "unknown",
        orderId: orderId || null,
        reason: "UNRECOGNIZED_PAYMENT_STATE",
        message:
          "The previous payment has an unrecognized status. Contact support before retrying.",
      })
    );
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
        paymentReceived: false,
        packageActivated: false,
        message:
          "Unable to verify your previous payment or subscription. Checkout is temporarily disabled.",
      },
      503
    );
  }
}