
import { NextResponse } from "next/server";
import { initiatePackagePayment } from "@/lib/initiatePackagePayment";

import { getStudentSession } from "@/lib/auth/getStudentSession";

import {
  reservePayment,
  savePaymentRecord,
} from "@/lib/paymentRecord";

import {
  calculatePackageTotal,
  getPromocodeDiscount,
  getSelectedPackagePrice,
} from "@/lib/promocodeHelper";

import {
  checkPackagePurchaseEligibility,
} from "@/lib/packagePurchaseEligibility";

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

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const number = Number(text);

  return Number.isSafeInteger(number)
    ? number
    : null;
}

function toPaise(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid package amount.");
  }

  const paise = Math.round(amount * 100);

  if (!Number.isSafeInteger(paise) || paise < 100) {
    throw new Error("Payment amount must be at least ₹1.");
  }

  return paise;
}

function validPromocode(value) {
  return /^[A-Za-z0-9_-]{2,50}$/.test(value);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return reply({
      status: false,
      reason: "INVALID_REQUEST",
      message: "Invalid payment request.",
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
  const cid = positiveId(body?.cid);
  const pid = positiveId(body?.pid);
  const priceId = positiveId(body?.priceId);

  if (!uid || session?.stage !== "completed") {
    return reply({
      status: false,
      reason: "UNAUTHORIZED",
      message: "Please sign in and complete your profile.",
    }, 401);
  }

  if (!cid || !pid || !priceId) {
    return reply({
      status: false,
      reason: "INVALID_PLAN",
      message: "Select a valid package and duration.",
    }, 400);
  }

  const promocode = String(
    body?.promocode ?? ""
  ).trim();

  if (promocode && !validPromocode(promocode)) {
    return reply({
      status: false,
      reason: "INVALID_PROMOCODE",
      message: "Enter a valid promocode.",
    }, 400);
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !secret) {
    return reply({
      status: false,
      reason: "CONFIGURATION_MISSING",
      message: "Online payments are not configured.",
    }, 503);
  }

  // Verify ownership before accepting a new purchase.
  let eligibility;

  try {
    eligibility = await checkPackagePurchaseEligibility({
      uid,
      cid,
      pid,
    });
  } catch (error) {
    console.error("Package eligibility:", error);

    return reply({
      status: false,
      reason: "OWNERSHIP_VERIFICATION_FAILED",
      message:
        "Unable to verify existing subscriptions. Please try later.",
    }, 503);
  }

  if (!eligibility?.allowed) {
    const reason =
      eligibility?.reason ??
      "OWNERSHIP_VERIFICATION_FAILED";

    return reply({
      status: false,
      reason,
      message:
        eligibility?.message ??
        "This package cannot be purchased currently.",
      expiryDate: eligibility?.expiryDate ?? null,
    }, reason === "ALREADY_ACTIVE" ? 409 : 503);
  }

  let packageDetails;
  let selectedPrice;
  let durationDays;

  try {
    const result = await getSelectedPackagePrice({
      uid,
      cid,
      pid,
      priceId: String(priceId),
    });

    packageDetails = result.packageDetails;
    selectedPrice = result.selectedPrice;
    durationDays = Number(result.durationDays);

    if (
      !selectedPrice ||
      !Number.isSafeInteger(durationDays) ||
      durationDays <= 0
    ) {
      throw new Error("Invalid selected duration.");
    }
  } catch (error) {
    console.error("Package pricing:", error);

    return reply({
      status: false,
      reason: "PLAN_VERIFICATION_FAILED",
      message: "Unable to verify package pricing.",
    }, 502);
  }

  let discountAmount = 0;
  let verifiedPromocode = "";

  if (promocode) {
    try {
      const subtotal = Number(
        selectedPrice.subtotal ??
        selectedPrice.current
      );

      if (!Number.isFinite(subtotal) || subtotal <= 0) {
        throw new Error("Invalid subtotal.");
      }

      const promo = await getPromocodeDiscount({
        uid,
        pid,
        promocode,
        subtotal,
      });

      if (!promo?.status) {
        return reply({
          status: false,
          reason: "INVALID_PROMOCODE",
          message:
            promo?.message ?? "Invalid promocode.",
        }, 400);
      }

      discountAmount = Number(promo.amount);

      if (
        !Number.isFinite(discountAmount) ||
        discountAmount < 0 ||
        discountAmount > subtotal
      ) {
        throw new Error("Invalid promocode discount.");
      }

      verifiedPromocode = String(
        promo.promocode ?? promocode
      ).trim();
    } catch (error) {
      console.error("Promocode validation:", error);

      return reply({
        status: false,
        reason: "PROMOCODE_VERIFICATION_FAILED",
        message: "Unable to verify promocode.",
      }, 502);
    }
  }

  let pricing;
  let amountInPaise;

  try {
    pricing = calculatePackageTotal(
      selectedPrice,
      discountAmount
    );

    amountInPaise = toPaise(pricing.total);
  } catch {
    return reply({
      status: false,
      reason: "INVALID_AMOUNT",
      message: "Invalid calculated payment amount.",
    }, 400);
  }

  // Atomic reservation must be implemented in paymentRecord.js.
  let reservation;

  try {
    reservation = await reservePayment(uid, cid, pid);
  } catch (error) {
    console.error("Payment reservation:", error);

    return reply({
      status: false,
      reason: "PAYMENT_TRACKING_UNAVAILABLE",
      message:
        "Payment tracking is unavailable. Checkout is disabled.",
    }, 503);
  }

  if (!reservation) {
    return reply({
      status: false,
      reason: "PAYMENT_ALREADY_PENDING",
      message:
        "A previous checkout requires verification. Do not pay again.",
    }, 409);
  }

  let order;
  let expiryDate;
  try {
    ({ order, expiryDate } = await initiatePackagePayment({
      uid, pid, priceId, amountPaise: amountInPaise,
      packageAmountPaise: toPaise(calculatePackageTotal(selectedPrice, 0).total),
      durationDays, duration: selectedPrice.validity,
      promocode: verifiedPromocode, deduction: discountAmount,
    }));
  } catch (error) {
    console.error("Backend payment initiation:", error?.message);
    const message = error?.message?.startsWith("The package backend")
      ? `${error.message} Payment has not opened; the earlier attempt needs verification before retrying.`
      : "Unable to confirm payment initiation. Check payment status before retrying.";
    try {
      await savePaymentRecord(uid, cid, pid, {
        ...reservation,
        state: "unknown",
        failureMessage: message,
      });
    } catch (saveError) {
      console.error("Unable to save initiation failure:", saveError?.message);
    }
    // PSC may have saved the transaction before a timeout; retain the reservation.
    return reply({
      status: false,
      reason: "ORDER_STATUS_UNKNOWN",
      message,
    }, 502);
  }

  try {
    await savePaymentRecord(uid, cid, pid, {
      uid,
      cid,
      pid,
      priceId: String(priceId),
      source: "psc",
      durationDays,
      expiryDate,
      promocode: verifiedPromocode,
      orderId: order.id,
      state: "checkout_created",
      createdAt: Date.now(),
      packageAmountPaise: amountInPaise,
    });
  } catch (error) {
    console.error("Save checkout record:", error);

    return reply({
      status: false,
      reason: "PAYMENT_TRACKING_UNAVAILABLE",
      message:
        "Order created but tracking failed. Contact support before retrying.",
    }, 503);
  }

  return reply({
    status: true,
    message: "Payment order created successfully.",
    keyId,
    order: {
      id: order.id,
      amount: amountInPaise,
      currency: "INR",
    },
    package: {
      id: pid,
      name:
        packageDetails?.title ||
        packageDetails?.package ||
        "Premium Package",
      validity: selectedPrice?.validity ?? "",
      durationDays,
    },
    pricing: {
      ...pricing,
      total: amountInPaise / 100,
    },
    promocode: verifiedPromocode,
    student: {
      name: session?.name ?? "",
      email: session?.email ?? "",
    },
  });
}
