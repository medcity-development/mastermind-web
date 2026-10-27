import "server-only";

export async function initiatePackagePayment({ uid, pid, priceId, amountPaise, packageAmountPaise, durationDays, duration, promocode = "", deduction = 0, now = new Date() }) {
  if (![uid, pid, priceId, amountPaise, packageAmountPaise, durationDays].every(value => Number.isSafeInteger(value) && value > 0) || !String(duration || "").trim() || !Number.isFinite(deduction) || deduction < 0) {
    throw new Error("Invalid verified package payment details.");
  }
  const baseUrl = process.env.PSC_API_BASE_URL?.trim().replace(/\/+$/, "");
  const api = process.env.PSC_API_KEY?.trim();
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!baseUrl || !api || !keyId || !secret) throw new Error("Payment configuration is incomplete.");

  // The backend expects a calendar date in India, not a browser-supplied expiry.
  const expiry = new Date(now.getTime() + 330 * 60 * 1000);
  expiry.setUTCDate(expiry.getUTCDate() + durationDays);
  const expiryDate = expiry.toISOString().slice(0, 10);
  const body = new FormData();
  for (const [name, value] of Object.entries({
    api, uid, pid,
    amount: (amountPaise / 100).toFixed(2),
    pack_amount: (packageAmountPaise / 100).toFixed(2),
    pack_priceid: priceId,
    pack_expiry: expiryDate,
    pack_duration: duration,
    promocode,
    deduction: deduction.toFixed(2),
  })) body.set(name, String(value));

  const response = await fetch(`${baseUrl}/initiateRazorpayPaymentLatest`, {
    method: "POST", body, headers: { Accept: "application/json" },
    cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok || !["true", "1"].includes(String(result?.status).toLowerCase()) || !/^order_[A-Za-z0-9]+$/.test(result?.orderid ?? "")) {
    // Keep diagnostics free of credentials and customer/payment details.
    console.error("PSC initiation response rejected:", {
      httpStatus: response.status,
      successfulStatus: ["true", "1"].includes(String(result?.status).toLowerCase()),
      hasValidOrderId: /^order_[A-Za-z0-9]+$/.test(result?.orderid ?? ""),
    });
    throw new Error(
      !response.ok
        ? `The package backend could not initiate checkout (HTTP ${response.status}).`
        : "The package backend did not confirm a valid Razorpay order."
    );
  }
  if (result.razorpayId !== keyId || Math.round(Number(result.amount) * 100) !== amountPaise) {
    throw new Error("Backend checkout key or amount does not match the verified purchase.");
  }

  // Confirm the returned order belongs to our Razorpay account and amount.
  const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(result.orderid)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`, Accept: "application/json" },
    cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  const order = await orderResponse.json();
  if (!orderResponse.ok || order.id !== result.orderid || order.currency !== "INR" || order.amount !== amountPaise || order.status !== "created" || order.amount_paid !== 0) {
    throw new Error("Backend Razorpay order could not be verified.");
  }
  return { order, expiryDate };
}
