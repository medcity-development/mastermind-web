import "server-only";

import { getPackageDetails } from "@/lib/packagesHelper";

function roundMoney(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
}

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    throw new Error("Invalid student or package ID.");
  }

  return text;
}

function isSuccess(value) {
  return ["true", "1"].includes(
    String(value ?? "").trim().toLowerCase()
  );
}

function getBaseSubtotal(price) {
  const subtotal = Number(
    price?.subtotal ?? price?.current
  );

  if (
    !Number.isFinite(subtotal) ||
    subtotal <= 0
  ) {
    throw new Error("Invalid package subtotal.");
  }

  return roundMoney(subtotal);
}

/* =========================================================
   DYNAMIC PROMOCODE VALIDATION
========================================================= */

export async function getPromocodeDiscount({
  uid,
  pid,
  promocode,
  subtotal,
}) {
  const apiBaseUrl = String(
    process.env.PSC_API_BASE_URL ?? ""
  ).trim();

  const apiKey = String(
    process.env.PSC_API_KEY ?? ""
  ).trim();

  if (!apiBaseUrl || !apiKey) {
    throw new Error("PSC API configuration is missing.");
  }

  const userId = normalizeId(uid);
  const packageId = normalizeId(pid);

  const code = String(promocode ?? "").trim();

  if (!/^[A-Za-z0-9_-]{2,50}$/.test(code)) {
    return {
      status: false,
      message: "Enter a valid promocode.",
    };
  }

  const baseSubtotal = Number(subtotal);

  if (
    !Number.isFinite(baseSubtotal) ||
    baseSubtotal <= 0
  ) {
    throw new Error("Invalid package subtotal.");
  }

  const formData = new FormData();

  formData.append("api", apiKey);
  formData.append("uid", userId);
  formData.append("pid", packageId);
  formData.append("promocode", code);

  const baseUrl = apiBaseUrl.replace(/\/+$/, "");

  const response = await fetch(
    `${baseUrl}/checkPromocodeValid`,
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

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Promocode API returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Unable to validate promocode right now."
    );
  }

  if (!isSuccess(result?.status)) {
    return {
      status: false,
      message:
        result?.message ||
        result?.msg ||
        "Invalid or expired promocode.",
    };
  }

  const returnedCode = String(
    result?.promocode ?? ""
  ).trim();

  const mode = String(
    result?.mode ?? ""
  ).trim().toLowerCase();

  const value = Number(result?.value);

  if (
    returnedCode &&
    returnedCode.toLowerCase() !== code.toLowerCase()
  ) {
    throw new Error(
      "Promocode validation returned a different code."
    );
  }

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(
      "Invalid discount returned by the backend."
    );
  }

  let discountAmount;

  if (mode === "percent") {
    if (value > 100) {
      throw new Error(
        "Invalid percentage discount."
      );
    }

    discountAmount = roundMoney(
      (baseSubtotal * value) / 100
    );
  } else if (
    mode === "fixed" ||
    mode === "amount"
  ) {
    // Assumes the backend returns fixed discounts
    // in rupees. Confirm this before enabling
    // fixed-amount codes in production.
    discountAmount = roundMoney(value);
  } else {
    throw new Error(
      "Unsupported promocode discount type."
    );
  }

  if (
    discountAmount <= 0 ||
    discountAmount >= baseSubtotal
  ) {
    return {
      status: false,
      message:
        "This promocode cannot be applied to the selected plan.",
    };
  }

  return {
    status: true,
    promocode: returnedCode || code,
    mode,
    value,
    amount: discountAmount,
    message:
      mode === "percent"
        ? `${value}% discount applied successfully.`
        : `${discountAmount} rupees discount applied successfully.`,
  };
}

/* =========================================================
   PACKAGE TOTAL
========================================================= */

export function calculatePackageTotal(
  price,
  discountAmount = 0
) {
  const subtotal = getBaseSubtotal(price);

  const gstRate = Number(price?.gst ?? 0);
  const discount = Number(discountAmount);

  if (
    !Number.isFinite(gstRate) ||
    gstRate < 0 ||
    !Number.isFinite(discount) ||
    discount < 0 ||
    discount >= subtotal
  ) {
    throw new Error("Invalid pricing details.");
  }

  const discountedSubtotal = roundMoney(
    subtotal - discount
  );

  const gstAmount = roundMoney(
    (discountedSubtotal * gstRate) / 100
  );

  const calculatedTotal = roundMoney(
    discountedSubtotal + gstAmount
  );

  const backendTotal = Number(price?.final);

  const total =
    discount === 0 &&
    price?.final !== null &&
    price?.final !== undefined &&
    price?.final !== "" &&
    Number.isFinite(backendTotal) &&
    backendTotal > 0
      ? roundMoney(backendTotal)
      : calculatedTotal;

  if (total < 1) {
    throw new Error(
      "Package total is too low for payment."
    );
  }

  return {
    subtotal,
    discountedSubtotal,
    gstRate,
    gstAmount,
    discountAmount: roundMoney(discount),
    total,
  };
}

/* =========================================================
   SELECT PACKAGE PRICE
========================================================= */

export async function getSelectedPackagePrice({
  uid,
  cid,
  pid,
  priceId,
}) {
  const packageDetails = await getPackageDetails({
    uid,
    cid,
    pid,
  });

  const selectedPrice =
    packageDetails?.priceOptions?.find(
      (option) =>
        String(option?.id ?? "") ===
        String(priceId ?? "")
    );

  const durationDays = Number(selectedPrice?.days);

  if (
    !selectedPrice ||
    !Number.isSafeInteger(durationDays) ||
    durationDays <= 0
  ) {
    throw new Error(
      "Selected package plan is invalid."
    );
  }

  return {
    packageDetails,
    selectedPrice,
    durationDays,
  };
}