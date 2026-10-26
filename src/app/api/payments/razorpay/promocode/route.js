import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import {
  calculatePackageTotal,
  getPromocodeDiscount,
  getSelectedPackagePrice,
} from "@/lib/promocodeHelper";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return reply(
      { status: false, message: "Invalid promocode request." },
      400
    );
  }

  const session = await getStudentSession();
  const uid = Number(session?.uid);

  if (
    !Number.isSafeInteger(uid) ||
    uid <= 0 ||
    session?.stage !== "completed"
  ) {
    return reply(
      { status: false, message: "Please sign in to use a promocode." },
      401
    );
  }

  const cid = Number(body?.cid);
  const pid = Number(body?.pid);
  const priceId = String(body?.priceId ?? "").trim();
  const promocode = String(body?.promocode ?? "").trim();

  if (
    !Number.isSafeInteger(cid) ||
    cid <= 0 ||
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    !priceId ||
    !/^[A-Za-z0-9_-]{2,50}$/.test(promocode)
  ) {
    return reply(
      { status: false, message: "Enter a valid promocode and plan." },
      400
    );
  }

  try {
    const { selectedPrice } =
      await getSelectedPackagePrice({ uid, cid, pid, priceId });
    const promo = await getPromocodeDiscount({
      uid,
      pid,
      promocode,
      subtotal: selectedPrice.subtotal || selectedPrice.current,
    });

    if (!promo.status) {
      return reply(
        { status: false, message: promo.message },
        400
      );
    }

    const pricing = calculatePackageTotal(
      selectedPrice,
      promo.amount
    );

    return reply({
      status: true,
      promocode: promo.promocode,
      mode: promo.mode,
      value: promo.value,
      discountAmount: pricing.discountAmount,
      subtotal: pricing.discountedSubtotal,
      gstRate: pricing.gstRate,
      gstAmount: pricing.gstAmount,
      total: pricing.total,
      message: "Promocode applied successfully.",
    });
  } catch (error) {
    console.error("Promocode validation failed:", error);
    return reply(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to validate this promocode.",
      },
      502
    );
  }
}
