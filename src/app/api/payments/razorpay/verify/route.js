
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getPackageDetails } from "@/lib/packagesHelper";
import { activatePurchasedPackage } from "@/lib/activatePurchasedPackage";
import { invalidatePackageAccess } from "@/lib/packageAccess";
import { checkPackagePurchaseEligibility } from "@/lib/packagePurchaseEligibility";
import { sendPurchaseConfirmationEmail } from "@/lib/sendPurchaseConfirmationEmail";

import {
  getPaymentRecord,
  savePaymentRecord,
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

function positiveId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) return null;

  const number = Number(text);

  return Number.isSafeInteger(number)
    ? number
    : null;
}

function validPaise(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function verifySignature(orderId, paymentId, signature, secret) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const actual = Buffer.from(signature, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

async function fetchRazorpay(path, authorization) {
  const response = await fetch(
    `https://api.razorpay.com/v1/${path}`,
    {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    }
  );

  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(
      result?.error?.description ??
      "Razorpay verification failed."
    );
  }

  return result;
}

function pending(reason, message, status = 409, extra = {}) {
  return reply({
    status: false,
    reason,
    paymentReceived: true,
    packageActivated: false,
    message,
    ...extra,
  }, status);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return reply({
      status: false,
      reason: "INVALID_REQUEST",
      message: "Invalid verification request.",
    }, 400);
  }

  let session;

  try {
    session = await getStudentSession();
  } catch {
    return reply({
      status: false,
      reason: "SESSION_UNAVAILABLE",
      message: "Unable to verify your session.",
    }, 503);
  }

  const uid = positiveId(session?.uid);

  if (!uid || session?.stage !== "completed") {
    return reply({
      status: false,
      reason: "UNAUTHORIZED",
      message: "Please sign in to continue.",
    }, 401);
  }

  const cid = positiveId(body?.cid);
  const pid = positiveId(body?.pid);
  const priceId = positiveId(body?.priceId);

  const orderId = String(
    body?.razorpay_order_id ?? ""
  ).trim();

  const paymentId = String(
    body?.razorpay_payment_id ?? ""
  ).trim();

  const signature = String(
    body?.razorpay_signature ?? ""
  ).trim();

  if (
    !cid ||
    !pid ||
    !priceId ||
    !/^order_[A-Za-z0-9]+$/.test(orderId) ||
    !/^pay_[A-Za-z0-9]+$/.test(paymentId)
  ) {
    return reply({
      status: false,
      reason: "INVALID_PAYMENT_DETAILS",
      message: "Invalid payment details.",
    }, 400);
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !secret ||
    !process.env.PSC_API_BASE_URL ||
    !process.env.PSC_API_KEY
  ) {
    return reply({
      status: false,
      reason: "CONFIGURATION_MISSING",
      message: "Payment configuration is incomplete.",
    }, 503);
  }

  if (
    !verifySignature(
      orderId,
      paymentId,
      signature,
      secret
    )
  ) {
    return reply({
      status: false,
      reason: "INVALID_SIGNATURE",
      message: "Payment signature verification failed.",
    }, 400);
  }

  let record;

  try {
    record = await getPaymentRecord(uid, cid, pid);
  } catch (error) {
    console.error("Payment record lookup:", error);

    return reply({
      status: false,
      reason: "PAYMENT_TRACKING_UNAVAILABLE",
      message:
        "Unable to verify saved payment details. Do not pay again.",
    }, 503);
  }

  if (
    !record ||
    record.orderId !== orderId ||
    String(record.priceId) !== String(priceId)
  ) {
    return reply({
      status: false,
      reason: "PAYMENT_RECORD_MISMATCH",
      message:
        "Payment does not match the saved checkout. Do not pay again if money was deducted.",
    }, 409);
  }

  if (
    record.paymentId &&
    record.paymentId !== paymentId
  ) {
    return reply({
      status: false,
      reason: "PAYMENT_RECORD_MISMATCH",
      message:
        "A different payment is recorded for this order.",
    }, 409);
  }

  if (record.state === "activated") {
    return reply({
      status: true,
      paymentReceived: true,
      packageActivated: true,
      message: "Package already activated.",
      orderId,
      paymentId,
    });
  }

  let order;
  let payment;

  try {
    const authorization =
      "Basic " +
      Buffer.from(
        `${keyId}:${secret}`
      ).toString("base64");

    [order, payment] = await Promise.all([
      fetchRazorpay(
        `orders/${encodeURIComponent(orderId)}`,
        authorization
      ),
      fetchRazorpay(
        `payments/${encodeURIComponent(paymentId)}`,
        authorization
      ),
    ]);
  } catch (error) {
    console.error("Razorpay lookup:", error);

    return pending(
      "RAZORPAY_LOOKUP_FAILED",
      "Unable to confirm the captured payment. Do not pay again.",
      502
    );
  }

  const notes =
    order?.notes &&
    typeof order.notes === "object"
      ? order.notes
      : {};

  // PSC creates the order without our custom Razorpay notes. Its order ID
  // is bound to this authenticated user and selected plan in our saved record.
  const checkoutOwnership = record.source === "psc"
    ? String(record.uid) === String(uid) &&
      String(record.cid) === String(cid) &&
      String(record.pid) === String(pid) &&
      String(record.priceId) === String(priceId)
    : String(notes.uid ?? "") === String(uid) &&
      String(notes.cid ?? "") === String(cid) &&
      String(notes.pid ?? "") === String(pid) &&
      String(notes.priceId ?? "") === String(priceId);

  const validOwnership = [
    order?.id === orderId,
    order?.status === "paid",
    payment?.id === paymentId,
    payment?.order_id === orderId,
    payment?.status === "captured",
    order?.currency === "INR",
    payment?.currency === "INR",
    checkoutOwnership,
  ].every(Boolean);

  if (!validOwnership) {
    return reply({
      status: false,
      reason: "PAYMENT_VERIFICATION_FAILED",
      paymentReceived:
        payment?.status === "captured",
      packageActivated: false,
      message:
        "Payment ownership or capture could not be verified. Do not pay again.",
    }, 409);
  }

  const orderAmount = order.amount;
  const orderPaid = order.amount_paid;
  const orderDue = order.amount_due;
  const paymentAmount = payment.amount;
  const refunded = payment.amount_refunded ?? 0;

  const validAmounts =
    [
      orderAmount,
      orderPaid,
      orderDue,
      paymentAmount,
      refunded,
    ].every(validPaise) &&
    orderAmount > 0 &&
    paymentAmount > 0 &&
    orderPaid === orderAmount &&
    orderDue === 0 &&
    refunded === 0 &&
    paymentAmount >= orderAmount &&
    (
      record.packageAmountPaise == null ||
      record.packageAmountPaise === orderAmount
    );

  if (!validAmounts) {
    return pending(
      "AMOUNT_MISMATCH",
      "Payment amounts require manual verification. Do not pay again."
    );
  }

  const additionalAmount =
    paymentAmount - orderAmount;

  const purchasedAtTimestamp = Number(
    payment.captured_at ??
    payment.created_at
  );

  const purchasedAt =
    Number.isSafeInteger(purchasedAtTimestamp) &&
    purchasedAtTimestamp > 0
      ? new Date(purchasedAtTimestamp * 1000)
      : new Date();

  try {
    await savePaymentRecord(uid, cid, pid, {
      ...record,
      state: "captured_pending",
      orderId,
      paymentId,
      packageAmountPaise: orderAmount,
      amountPaise: paymentAmount,
      capturedAt: purchasedAt.toISOString(),
    });
  } catch (error) {
    console.error("Captured payment persistence:", error);

    return pending(
      "PAYMENT_TRACKING_UNAVAILABLE",
      "Payment captured, but tracking failed. Contact support.",
      503
    );
  }

  // Customer-borne fees cannot be verified merely by
  // subtracting order.amount from payment.amount.
  //
  // A production reconciliation mechanism must obtain
  // independently verified Razorpay fee details.
  if (additionalAmount > 0) {
    return pending(
      "FEE_RECONCILIATION_REQUIRED",
      "Payment received. Additional customer fees require verification before activation. Do not pay again.",
      409,
      {
        pricing: {
          packageAmount: orderAmount / 100,
          additionalAmount: additionalAmount / 100,
          totalPaid: paymentAmount / 100,
          currency: "INR",
        },
      }
    );
  }

  let packageDetails;
  let durationDays;

  try {
    packageDetails = await getPackageDetails({
      uid,
      cid,
      pid,
    });

    const selectedPrice =
      packageDetails?.priceOptions?.find(
        (item) =>
          String(item.id) === String(priceId)
      );

    durationDays = Number(selectedPrice?.days);

    if (
      !selectedPrice ||
      !Number.isSafeInteger(durationDays) ||
      durationDays <= 0 ||
      Number(record.source === "psc" ? record.durationDays : notes.durationDays) !== durationDays
    ) {
      throw new Error("Plan duration mismatch.");
    }
  } catch (error) {
    console.error("Plan verification:", error);

    return pending(
      "PLAN_VERIFICATION_FAILED",
      "Payment received, but plan details could not be verified."
    );
  }

  let confirmedSubscription;
  try {
    // The helper must be idempotent for paymentId.
    // PSC resolves the package from the initiated order ID.
    await activatePurchasedPackage({
      uid,
      pid,
      paymentId,
      orderId,
    });
    invalidatePackageAccess(uid, cid);
    confirmedSubscription = await checkPackagePurchaseEligibility({ uid, cid, pid });
    if (confirmedSubscription.reason !== "ALREADY_ACTIVE") {
      throw new Error("The backend has not confirmed the saved active subscription.");
    }
  } catch (error) {
    console.error("Package activation:", error);

    return pending(
      "PACKAGE_ACTIVATION_UNCONFIRMED",
      "Payment received, but package activation could not be confirmed. Contact support."
    );
  }

  try {
    await savePaymentRecord(uid, cid, pid, {
      ...record,
      state: "activated",
      orderId,
      paymentId,
      packageAmountPaise: orderAmount,
      amountPaise: paymentAmount,
      capturedAt: purchasedAt.toISOString(),
      activatedAt: new Date().toISOString(),
      validUntil: confirmedSubscription.expiryDate,
    });
  } catch (error) {
    console.error("Activated record persistence:", error);

    return reply({
      status: false,
      reason: "ACTIVATION_RECORD_FAILED",
      paymentReceived: true,
      packageActivated: true,
      message:
        "Package activated, but payment tracking could not be updated.",
    }, 503);
  }

  try {
    await invalidatePackageAccess(uid, cid);
  } catch (error) {
    console.error("Package cache invalidation:", error);
  }

  let confirmationEmailSent = false;

  if (session?.email) {
    try {
      const result =
        await sendPurchaseConfirmationEmail({
          email: session.email,
          name: session.name || "Student",
          packageName:
            packageDetails?.title ||
            packageDetails?.package ||
            "Premium Package",
          orderId,
          paymentId,
          amountPaise: paymentAmount,
          validityDays: durationDays,
          purchasedAt,
        });

      confirmationEmailSent =
        Boolean(result?.status);
    } catch (error) {
      console.error("Confirmation email:", error);
    }
  }

  return reply({
    status: true,
    message:
      "Payment verified and package activated successfully.",
    paymentReceived: true,
    packageActivated: true,
    orderId,
    paymentId,
    package: {
      id: pid,
      cid,
      priceId,
      name:
        packageDetails?.title ||
        packageDetails?.package ||
        "Premium Package",
    },
    pricing: {
      packageAmount: orderAmount / 100,
      additionalAmount: 0,
      totalPaid: paymentAmount / 100,
      currency: "INR",
    },
    durationDays,
    validFrom:
      purchasedAt.toISOString().slice(0, 10),
    validUntil: confirmedSubscription.expiryDate,
    confirmationEmailSent,
  });
}
