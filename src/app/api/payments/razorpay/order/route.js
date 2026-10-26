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
      { status: false, message: "Invalid payment request." },
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
      { status: false, message: "Please sign in to purchase a plan." },
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
    (promocode && !/^[A-Za-z0-9_-]{2,50}$/.test(promocode))
  ) {
    return reply(
      { status: false, message: "A valid package and plan are required." },
      400
    );
  }

  const razorpayKeyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const razorpayKeySecret = String(
    process.env.RAZORPAY_KEY_SECRET || ""
  ).trim();

  if (!razorpayKeyId || !razorpayKeySecret) {
    console.error("Razorpay credentials are not configured.");
    return reply(
      { status: false, message: "Online payments are not configured yet." },
      503
    );
  }

  try {
    const { packageDetails, selectedPrice, durationDays } =
      await getSelectedPackagePrice({ uid, cid, pid, priceId });
    const promo = promocode
      ? await getPromocodeDiscount({
          uid,
          pid,
          promocode,
          subtotal: selectedPrice.subtotal || selectedPrice.current,
        })
      : {
          status: true,
          promocode: "",
          mode: "",
          value: 0,
          amount: 0,
        };

    if (!promo.status) {
      return reply(
        { status: false, message: promo.message },
        400
      );
    }

    const pricing = calculatePackageTotal(selectedPrice, promo.amount);
    const amountInRupees = pricing.total;
    const amountInPaise = Math.round(amountInRupees * 100);

    if (
      !Number.isFinite(amountInRupees) ||
      amountInRupees <= 0 ||
      !Number.isSafeInteger(amountInPaise) ||
      amountInPaise <= 0
    ) {
      return reply(
        {
          status: false,
          message: "The selected plan has an invalid price.",
        },
        400
      );
    }

    const auth = Buffer.from(
      `${razorpayKeyId}:${razorpayKeySecret}`
    ).toString("base64");
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `mm-${uid}-${Date.now()}`.slice(0, 40),
        notes: {
          uid: String(uid),
          cid: String(cid),
          pid: String(pid),
          priceId,
          durationDays: String(selectedPrice.days || ""),
          promocode,
          discountMode: promo.mode,
          discountValue: String(promo.value),
          discountAmount: String(pricing.discountAmount),
        },
      }),
      cache: "no-store",
    });
    const order = await orderResponse.json();

    if (!orderResponse.ok || !order?.id) {
      console.error("Razorpay order creation failed:", {
        status: orderResponse.status,
        message: order?.error?.description || order?.message,
      });
      return reply(
        {
          status: false,
          message:
            orderResponse.status === 401
              ? "Razorpay rejected the configured credentials. Check that the Key ID and Key Secret are a matching pair from the same Razorpay account and mode (test or live)."
              : "Unable to start payment. Please try again.",
        },
        502
      );
    }

    return reply({
      status: true,
      keyId: razorpayKeyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      package: {
        id: pid,
        name: packageDetails.title || packageDetails.package || "Premium plan",
        validity: selectedPrice.validity || "",
        durationDays,
      },
      pricing,
      student: {
        name: session.name || "",
        email: session.email || "",
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return reply(
      { status: false, message: "Unable to start payment. Please try again." },
      502
    );
  }
}
