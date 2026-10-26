import { invalidatePackageAccess } from "@/lib/packageAccess";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/getStudentSession";
import { getPackageDetails } from "@/lib/packagesHelper";

export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function hasValidSignature(orderId, paymentId, signature, secret) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

async function readJson(response, serviceName) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${serviceName} returned an invalid response.`);
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return reply(
      { status: false, message: "Invalid payment verification request." },
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
      { status: false, message: "Please sign in to continue." },
      401
    );
  }

  const orderId = String(body?.razorpay_order_id ?? "").trim();
  const paymentId = String(body?.razorpay_payment_id ?? "").trim();
  const signature = String(body?.razorpay_signature ?? "").trim();
  const cid = Number(body?.cid);
  const pid = Number(body?.pid);
  const priceId = String(body?.priceId ?? "").trim();

  if (
    !orderId ||
    !paymentId ||
    !signature ||
    !Number.isSafeInteger(cid) ||
    cid <= 0 ||
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    !priceId
  ) {
    return reply(
      { status: false, message: "Payment details are incomplete." },
      400
    );
  }

  const razorpayKeyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const razorpayKeySecret = String(
    process.env.RAZORPAY_KEY_SECRET || ""
  ).trim();
  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!razorpayKeyId || !razorpayKeySecret || !apiBaseUrl || !apiKey) {
    console.error("Payment activation service configuration is missing.");
    return reply(
      { status: false, message: "Payment verification is unavailable." },
      503
    );
  }

  if (
    !hasValidSignature(orderId, paymentId, signature, razorpayKeySecret)
  ) {
    return reply(
      { status: false, message: "Payment signature could not be verified." },
      400
    );
  }

  const authorization = `Basic ${Buffer.from(
    `${razorpayKeyId}:${razorpayKeySecret}`
  ).toString("base64")}`;

  try {
    const [orderResponse, paymentResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: authorization },
        cache: "no-store",
      }),
      fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: { Authorization: authorization },
          cache: "no-store",
        }
      ),
    ]);
    const [order, payment] = await Promise.all([
      readJson(orderResponse, "Razorpay order"),
      readJson(paymentResponse, "Razorpay payment"),
    ]);

    if (!orderResponse.ok || !paymentResponse.ok) {
      console.error("Razorpay payment lookup failed.", {
        orderStatus: orderResponse.status,
        paymentStatus: paymentResponse.status,
      });
      return reply(
        { status: false, message: "Unable to verify payment status." },
        502
      );
    }

    const notes = order.notes || {};
    if (
      order.id !== orderId ||
      order.status !== "paid" ||
      String(notes.uid) !== String(uid) ||
      String(notes.cid) !== String(cid) ||
      String(notes.pid) !== String(pid) ||
      String(notes.priceId) !== priceId ||
      payment.order_id !== orderId ||
      payment.status !== "captured" ||
      Number(payment.amount) !== Number(order.amount) ||
      payment.currency !== "INR"
    ) {
      return reply(
        {
          status: false,
          message: "Payment is not captured for this selected plan.",
        },
        409
      );
    }

    const packageDetails = await getPackageDetails({ uid, cid, pid });
    const selectedPrice = packageDetails?.priceOptions?.find(
      (option) => String(option.id ?? "").trim() === priceId
    );
    const durationDays = Number(selectedPrice?.days);

    if (!selectedPrice || !Number.isSafeInteger(durationDays) || durationDays <= 0) {
      return reply(
        {
          status: false,
          message: "The purchased plan duration could not be verified.",
          paymentReceived: true,
        },
        502
      );
    }

    if (Number(notes.durationDays) !== durationDays) {
      return reply(
        {
          status: false,
          message: "The purchased plan duration did not match the order.",
          paymentReceived: true,
        },
        409
      );
    }

    const paymentReceivedAtSeconds = Number(
      payment.captured_at || payment.created_at
    );
    if (!Number.isFinite(paymentReceivedAtSeconds) || paymentReceivedAtSeconds <= 0) {
      return reply(
        {
          status: false,
          message: "The payment date could not be verified.",
          paymentReceived: true,
        },
        502
      );
    }

    const formData = new FormData();
    formData.append("api", apiKey);
    formData.append("uid", String(uid));
    formData.append("transaction_id", paymentId);
    formData.append("orderid", orderId);
    formData.append("Pid", String(pid));
    formData.append("price_id", priceId);

    const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");
    const activationResponse = await fetch(
      `${baseUrl}/activateUserPackage`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    const activation = await readJson(
      activationResponse,
      "Package activation"
    );

    if (!activationResponse.ok || activation?.status !== true) {
      console.error("activateUserPackage failed after captured payment.", {
        status: activationResponse.status,
        message: activation?.msg || activation?.message,
        paymentId,
        pid,
      });
      return reply(
        {
          status: false,
          message:
            activation?.msg ||
            activation?.message ||
            "Payment was received, but the package could not be activated. Please contact support.",
          paymentReceived: true,
        },
        502
      );
    }

    invalidatePackageAccess(uid, cid);

    const paymentReceivedAt = new Date(paymentReceivedAtSeconds * 1000);
    const validUntil = new Date(paymentReceivedAt);
    validUntil.setUTCDate(validUntil.getUTCDate() + durationDays);

    return reply({
      status: true,
      message:
        activation?.msg || "Payment successful. Your plan is now active.",
      paymentId,
      durationDays,
      validFrom: paymentReceivedAt.toISOString().slice(0, 10),
      validUntil: validUntil.toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error("Payment verification or package activation failed:", error);
    return reply(
      {
        status: false,
        message:
          "Payment could not be verified or your plan could not be activated. Please contact support before retrying.",
      },
      502
    );
  }
}
