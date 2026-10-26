import "server-only";

import { getPackageDetails } from "@/lib/packagesHelper";

export async function getPromocodeDiscount({
  uid,
  pid,
  promocode,
  subtotal,
}) {
  const apiBaseUrl = process.env.PSC_API_BASE_URL;
  const apiKey = process.env.PSC_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    throw new Error("PSC API configuration is missing.");
  }

  if (!/^[1-9]\d*$/.test(String(uid ?? ""))) {
    throw new Error("A valid student ID is required.");
  }

  if (!/^[1-9]\d*$/.test(String(pid ?? ""))) {
    throw new Error("A valid package ID is required.");
  }

  const formData = new FormData();
  formData.append("api", apiKey);
  formData.append("uid", String(uid));
  formData.append("promocode", promocode);
  formData.append("pid", String(pid));

  const baseUrl = String(apiBaseUrl).trim().replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/checkPromocodeValid`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error("checkPromocodeValid returned invalid JSON.");
    throw new Error("The promocode service returned an invalid response.");
  }

  const isSuccess =
    result?.status === true ||
    result?.status === 1 ||
    ["true", "1"].includes(String(result?.status ?? "").trim().toLowerCase());

  if (!response.ok || !isSuccess) {
    return {
      status: false,
      message:
        result?.msg || result?.message || "This promocode is not valid.",
    };
  }

  const returnedCode = String(result?.promocode ?? "").trim();
  const mode = String(result?.mode ?? "").trim().toLowerCase();
  const value = Number(result?.value);
  const baseSubtotal = Number(subtotal);

  if (
    (returnedCode && returnedCode.toLowerCase() !== promocode.trim().toLowerCase()) ||
    mode !== "percent" ||
    !Number.isFinite(value) ||
    value <= 0 ||
    value > 100 ||
    !Number.isFinite(baseSubtotal) ||
    baseSubtotal <= 0
  ) {
    console.error("checkPromocodeValid returned invalid promo details.");
    throw new Error("The promocode service returned invalid discount details.");
  }

  const amount = Math.round(
    (baseSubtotal * value / 100 + Number.EPSILON) * 100
  ) / 100;

  if (amount >= baseSubtotal) {
    throw new Error("This promocode cannot cover the full plan price.");
  }

  return {
    status: true,
    promocode: returnedCode || promocode.trim(),
    mode,
    value,
    amount,
  };
}

export function calculatePackageTotal(price, discountAmount = 0) {
  const subtotal = Number(price?.subtotal || price?.current);
  const gstRate = Number(price?.gst || 0);

  if (
    !Number.isFinite(subtotal) ||
    subtotal <= 0 ||
    !Number.isFinite(gstRate) ||
    gstRate < 0
  ) {
    throw new Error("The selected plan has invalid pricing details.");
  }

  if (
    !Number.isFinite(discountAmount) ||
    discountAmount < 0 ||
    discountAmount > subtotal
  ) {
    throw new Error("The promocode discount is invalid for this plan.");
  }

  const discountedSubtotal = Math.round(
    (subtotal - discountAmount + Number.EPSILON) * 100
  ) / 100;
  const gstAmount = Math.round(
    (discountedSubtotal * gstRate / 100 + Number.EPSILON) * 100
  ) / 100;
  const calculatedTotal = Math.round(
    (discountedSubtotal + gstAmount + Number.EPSILON) * 100
  ) / 100;
  const backendTotal = Number(price?.final);
  const total =
    discountAmount === 0 && Number.isFinite(backendTotal) && backendTotal > 0
      ? backendTotal
      : calculatedTotal;

  if (total < 1) {
    throw new Error(
      "The discount covers the full plan price. Please contact support to activate this offer."
    );
  }

  return {
    subtotal,
    discountedSubtotal,
    gstRate,
    gstAmount,
    discountAmount,
    total,
  };
}

export async function getSelectedPackagePrice({ uid, cid, pid, priceId }) {
  const packageDetails = await getPackageDetails({ uid, cid, pid });
  const selectedPrice = packageDetails?.priceOptions?.find(
    (option) => String(option.id ?? "").trim() === String(priceId).trim()
  );
  const durationDays = Number(selectedPrice?.days);

  if (
    !selectedPrice ||
    !Number.isSafeInteger(durationDays) ||
    durationDays <= 0
  ) {
    throw new Error("The selected active plan or its duration is invalid.");
  }

  return {
    packageDetails,
    selectedPrice,
    durationDays,
  };
}
