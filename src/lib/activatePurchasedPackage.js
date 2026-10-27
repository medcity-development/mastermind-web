import "server-only";

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const id = Number(text);

  return Number.isSafeInteger(id) ? id : null;
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

export async function activatePurchasedPackage({
  uid,
  pid,
  paymentId,
  orderId,
}) {
  const userId = normalizeId(uid);
  const packageId = normalizeId(pid);

  const verifiedPaymentId = String(
    paymentId ?? ""
  ).trim();

  const verifiedOrderId = String(
    orderId ?? ""
  ).trim();

  if (
    !userId ||
    !packageId ||
    !/^pay_[A-Za-z0-9]+$/.test(verifiedPaymentId) ||
    !/^order_[A-Za-z0-9]+$/.test(verifiedOrderId)
  ) {
    throw new Error(
      "Invalid verified purchase details."
    );
  }

  const baseUrl = String(
    process.env.PSC_API_BASE_URL ?? ""
  )
    .trim()
    .replace(/\/+$/, "");

  const apiKey = String(
    process.env.PSC_API_KEY ?? ""
  ).trim();

  if (!baseUrl || !apiKey) {
    throw new Error(
      "PSC API configuration is missing."
    );
  }

  const formData = new FormData();

  formData.set("api", apiKey);
  formData.set("uid", String(userId));
  formData.set(
    "transaction_id",
    verifiedPaymentId
  );
  formData.set("orderid", verifiedOrderId);

  // PSC resolves the package and duration from the previously initiated order.
  // Keep pid for local validation; the activation API does not require it.

  let response;

  try {
    response = await fetch(
      `${baseUrl}/activateUserPackage`,
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
      "PSC activation transport error:",
      error?.message
    );

    throw new Error(
      "Payment was received, but the activation response is unavailable. Do not pay again."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "PSC activation returned an invalid response. Do not pay again."
    );
  }

  if (
    !response.ok ||
    !isSuccess(result?.status)
  ) {
    console.error(
      "PSC package activation failed:",
      {
        httpStatus: response.status,
        message:
          result?.message ??
          result?.msg ??
          null,
      }
    );

    throw new Error(
      "Payment received, but package activation could not be confirmed. Do not pay again."
    );
  }

  return result;
}
