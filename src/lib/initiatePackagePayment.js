import "server-only";

const ORDER_ID_PATTERN = /^order_[A-Za-z0-9]+$/;

function positiveInteger(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function isSuccess(value) {
  return (
    value === true ||
    value === 1 ||
    ["true", "1"].includes(
      String(value ?? "").trim().toLowerCase()
    )
  );
}

function getConfig() {
  const baseUrl = String(
    process.env.PSC_API_BASE_URL ?? ""
  )
    .trim()
    .replace(/\/+$/, "");

  const api = String(
    process.env.PSC_API_KEY ?? ""
  ).trim();

  const keyId = String(
    process.env.RAZORPAY_KEY_ID ?? ""
  ).trim();

  const secret = String(
    process.env.RAZORPAY_KEY_SECRET ?? ""
  ).trim();

  if (!baseUrl || !api || !keyId || !secret) {
    throw new Error(
      "Payment configuration is incomplete."
    );
  }

  return { baseUrl, api, keyId, secret };
}

function getExpiryDate(now, durationDays) {
  // Use the Indian calendar date for the PSC backend.
  const indiaDate = new Date(
    now.getTime() + 330 * 60 * 1000
  );

  indiaDate.setUTCDate(
    indiaDate.getUTCDate() + durationDays
  );

  return indiaDate.toISOString().slice(0, 10);
}

async function parseJson(response, service) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `${service} returned an invalid JSON response.`
    );
  }

  return result;
}

async function verifyRazorpayOrder({
  orderId,
  keyId,
  secret,
  amountPaise,
}) {
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
      signal: AbortSignal.timeout(20000),
    }
  );

  const order = await parseJson(
    response,
    "Razorpay"
  );

  if (!response.ok) {
    throw new Error(
      "Unable to verify the Razorpay order. Do not retry payment until the previous order is checked."
    );
  }

  if (
    order?.id !== orderId ||
    order?.currency !== "INR" ||
    Number(order?.amount) !== amountPaise ||
    order?.status !== "created" ||
    Number(order?.amount_paid) !== 0
  ) {
    throw new Error(
      "The Razorpay order could not be verified. Do not retry payment until its status is checked."
    );
  }

  return order;
}

export async function initiatePackagePayment({
  uid,
  pid,
  priceId,
  amountPaise,
  packageAmountPaise,
  durationDays,
  duration,
  promocode = "",
  deduction = 0,
  now = new Date(),
}) {
  const userId = positiveInteger(uid);
  const packageId = positiveInteger(pid);
  const selectedPriceId = positiveInteger(priceId);
  const paymentAmount = positiveInteger(amountPaise);
  const originalAmount = positiveInteger(
    packageAmountPaise
  );
  const days = positiveInteger(durationDays);

  const durationLabel = String(
    duration ?? ""
  ).trim();

  const discount = Number(deduction);

  if (
    !userId ||
    !packageId ||
    !selectedPriceId ||
    !paymentAmount ||
    !originalAmount ||
    !days ||
    !durationLabel ||
    !Number.isFinite(discount) ||
    discount < 0
  ) {
    throw new Error(
      "Invalid verified package payment details."
    );
  }

  const { baseUrl, api, keyId, secret } =
    getConfig();

  const expiryDate = getExpiryDate(now, days);

  const formData = new FormData();

  const fields = {
    api,
    uid: userId,
    pid: packageId,
    amount: (paymentAmount / 100).toFixed(2),
    pack_amount: (originalAmount / 100).toFixed(2),
    pack_priceid: selectedPriceId,
    pack_expiry: expiryDate,
    pack_duration: durationLabel,
    promocode: String(promocode ?? "").trim(),
    deduction: discount.toFixed(2),
  };

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, String(value));
  }

  let response;

  try {
    response = await fetch(
      `${baseUrl}/initiateRazorpayPaymentLatest`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );
  } catch (error) {
    console.error(
      "PSC payment initiation transport failure:",
      error?.message
    );

    throw new Error(
      "The payment backend did not respond. An order may have been created. Do not pay again until its status is verified."
    );
  }

  const result = await parseJson(
    response,
    "PSC payment initiation"
  );

  if (
    !response.ok ||
    !isSuccess(result?.status)
  ) {
    console.error(
      "PSC payment initiation rejected:",
      {
        httpStatus: response.status,
        success: isSuccess(result?.status),
        message:
          result?.message ??
          result?.msg ??
          null,
      }
    );

    throw new Error(
      "The package backend did not confirm payment initiation. Check the previous attempt before retrying."
    );
  }

  const orderId = String(
    result?.orderid ?? ""
  ).trim();

  if (!ORDER_ID_PATTERN.test(orderId)) {
    throw new Error(
      "The backend returned an invalid Razorpay order ID. Do not pay again until the attempt is checked."
    );
  }

  if (String(result?.razorpayId ?? "") !== keyId) {
    throw new Error(
      "The backend returned a different Razorpay account key."
    );
  }

  const backendAmount = Number(result?.amount);

  if (
    !Number.isFinite(backendAmount) ||
    Math.round(backendAmount * 100) !==
      paymentAmount
  ) {
    throw new Error(
      "The backend order amount does not match the selected package price."
    );
  }

  const order = await verifyRazorpayOrder({
    orderId,
    keyId,
    secret,
    amountPaise: paymentAmount,
  });

  return {
    order,
    expiryDate,
  };
}