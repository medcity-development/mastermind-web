
import "server-only";

import { getPackageDetails } from "@/lib/packagesHelper";

/* =========================================================
   HELPERS
========================================================= */

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    throw new Error("A valid numeric ID is required.");
  }

  const number = Number(text);

  if (!Number.isSafeInteger(number)) {
    throw new Error("Invalid numeric ID.");
  }

  return String(number);
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

function roundMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error("Invalid monetary amount.");
  }

  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function getBaseSubtotal(price) {
  const subtotal = Number(
    price?.subtotal ?? price?.current
  );

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    throw new Error(
      "The selected plan has an invalid subtotal."
    );
  }

  return roundMoney(subtotal);
}

/* =========================================================
   VALIDATE PROMOCODE USING PSC API

   Admin-created codes are validated dynamically.
   No promocode is hardcoded in the frontend.
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
    throw new Error(
      "PSC API configuration is missing."
    );
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
    throw new Error(
      "The selected plan subtotal is invalid."
    );
  }

  const formData = new FormData();

  formData.append("api", apiKey);
  formData.append("uid", userId);
  formData.append("promocode", code);
  formData.append("pid", packageId);

  const baseUrl = apiBaseUrl.replace(/\/+$/, "");

  const response = await fetch(
    `${baseUrl}/checkPromocodeValid`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The promocode service returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Unable to validate the promocode right now."
    );
  }

  if (!isSuccess(result?.status)) {
    return {
      status: false,
      message:
        result?.message ||
        result?.msg ||
        "This promocode is invalid or expired.",
    };
  }

  const returnedCode = String(
    result?.promocode ?? code
  ).trim();

  if (
    returnedCode.toLowerCase() !==
    code.toLowerCase()
  ) {
    throw new Error(
      "The promocode service returned a mismatched code."
    );
  }

  const mode = String(
    result?.mode ?? ""
  )
    .trim()
    .toLowerCase();

  const value = Number(result?.value);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      "The promocode service returned an invalid discount."
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
  } else if (mode === "fixed" || mode === "amount") {
    // Only use these modes if the PSC backend
    // defines value as an INR discount.
    discountAmount = roundMoney(value);
  } else {
    throw new Error(
      "Unsupported promocode discount mode."
    );
  }

  if (
    discountAmount <= 0 ||
    discountAmount >= baseSubtotal
  ) {
    throw new Error(
      "This promocode cannot be applied to the selected plan."
    );
  }

  return {
    status: true,
    promocode: returnedCode,
    mode,
    value,
    amount: discountAmount,
    discountAmount,
    message: "Promocode applied successfully.",
  };
}

/* =========================================================
   CALCULATE FINAL PACKAGE PRICE
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
    gstRate > 100
  ) {
    throw new Error(
      "The selected plan has invalid GST details."
    );
  }

  if (
    !Number.isFinite(discount) ||
    discount < 0 ||
    discount >= subtotal
  ) {
    throw new Error(
      "The selected plan has an invalid discount."
    );
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

  const hasBackendTotal =
    price?.final !== null &&
    price?.final !== undefined &&
    price?.final !== "" &&
    Number.isFinite(backendTotal) &&
    backendTotal > 0;

  const total =
    discount === 0 && hasBackendTotal
      ? roundMoney(backendTotal)
      : calculatedTotal;

  if (total < 1) {
    throw new Error(
      "The final payment amount must be at least ₹1."
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
   GET SELECTED PACKAGE PRICE
========================================================= */

export async function getSelectedPackagePrice({
  uid,
  cid,
  pid,
  priceId,
}) {
  const userId = normalizeId(uid);
  const categoryId = normalizeId(cid);
  const packageId = normalizeId(pid);
  const selectedPriceId = normalizeId(priceId);

  const packageDetails = await getPackageDetails({
    uid: Number(userId),
    cid: Number(categoryId),
    pid: Number(packageId),
  });

  const priceOptions = Array.isArray(
    packageDetails?.priceOptions
  )
    ? packageDetails.priceOptions
    : [];

  const selectedPrice = priceOptions.find(
    (option) =>
      String(option?.id ?? "").trim() ===
      selectedPriceId
  );

  if (!selectedPrice) {
    throw new Error(
      "The selected package plan was not found."
    );
  }

  const durationDays = Number(selectedPrice.days);

  if (
    !Number.isSafeInteger(durationDays) ||
    durationDays <= 0
  ) {
    throw new Error(
      "The selected plan duration is invalid."
    );
  }

  return {
    packageDetails,
    selectedPrice,
    durationDays,
  };
}
