
import { NextResponse } from "next/server";

import { getStudentSession } from "@/lib/auth/getStudentSession";

import {
  calculatePackageTotal,
  getPromocodeDiscount,
  getSelectedPackagePrice,
} from "@/lib/promocodeHelper";

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
      "Cache-Control": "private, no-store",
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

  const number = Number(text);

  return Number.isSafeInteger(number)
    ? number
    : null;
}

function normalizePromocode(value) {
  return String(value ?? "").trim();
}

/* =========================================================
   POST - VALIDATE PROMOCODE
========================================================= */

export async function POST(request) {
  let session;

  try {
    session = await getStudentSession();
  } catch (error) {
    console.error(
      "Promocode session verification failed:",
      error?.message
    );

    return reply(
      {
        status: false,
        message: "Unable to verify your session.",
      },
      503
    );
  }

  const uid = normalizeId(session?.uid);

  if (
    !uid ||
    session?.stage !== "completed"
  ) {
    return reply(
      {
        status: false,
        message:
          "Please sign in to apply a promocode.",
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
        message: "Invalid promocode request.",
      },
      400
    );
  }

  const cid = normalizeId(body?.cid);
  const pid = normalizeId(body?.pid);
  const priceId = normalizeId(body?.priceId);

  const promocode = normalizePromocode(
    body?.promocode
  );

  if (!cid || !pid || !priceId) {
    return reply(
      {
        status: false,
        message:
          "Please select a valid package and plan.",
      },
      400
    );
  }

  if (
    !/^[A-Za-z0-9_-]{2,50}$/.test(promocode)
  ) {
    return reply(
      {
        status: false,
        message: "Enter a valid promocode.",
      },
      400
    );
  }

  try {
    /* =====================================================
       GET CURRENT PACKAGE PRICE FROM SERVER
    ===================================================== */

    const {
      selectedPrice,
      durationDays,
    } = await getSelectedPackagePrice({
      uid,
      cid,
      pid,
      priceId,
    });

    /* =====================================================
       VERIFY ENTERED PROMOCODE AGAINST PSC API
    ===================================================== */

    const promo = await getPromocodeDiscount({
      uid,
      pid,
      promocode,
      subtotal:
        selectedPrice.subtotal ??
        selectedPrice.current,
    });

    if (!promo.status) {
      return reply(
        {
          status: false,
          message:
            promo.message ||
            "Invalid or expired promocode.",
        },
        400
      );
    }

    /* =====================================================
       CALCULATE DISCOUNTED PAYMENT AMOUNT
    ===================================================== */

    const pricing = calculatePackageTotal(
      selectedPrice,
      promo.discountAmount
    );

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return reply({
      status: true,

      message: "Promocode applied successfully.",

      promocode: promo.promocode,
      mode: promo.mode,
      value: promo.value,

      cid,
      pid,
      priceId,
      durationDays,

      originalSubtotal: pricing.subtotal,

      discountAmount: pricing.discountAmount,
      amount: pricing.discountAmount,

      subtotal: pricing.discountedSubtotal,
      discountedSubtotal: pricing.discountedSubtotal,

      gstRate: pricing.gstRate,
      gstAmount: pricing.gstAmount,

      total: pricing.total,
      totalPaise: Math.round(pricing.total * 100),
    });
  } catch (error) {
    console.error(
      "Promocode validation failed:",
      {
        message:
          error?.message ||
          "Unknown promocode error",
      }
    );

    return reply(
      {
        status: false,
        message:
          "Unable to validate this promocode right now. Please try again.",
      },
      502
    );
  }
}
