
/* =========================================================
   MASTERMIND ACADEMY
   PACKAGE ACCESS UTILITIES
========================================================= */

function normalizePackageId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? String(id)
    : null;
}

/* =========================================================
   STATUS
========================================================= */

function isActiveStatus(value) {
  return ["1", "true", "active", "yes"].includes(
    String(value ?? "").trim().toLowerCase()
  );
}

/* =========================================================
   INDIA DATE
========================================================= */

function getTodayInIndia() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

/* =========================================================
   DATE NORMALIZATION
========================================================= */

function normalizeDate(value) {
  if (!value) return null;

  const text = String(value).trim();

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T]|$)/
  );

  if (!match) return null;

  const date = `${match[1]}-${match[2]}-${match[3]}`;

  const parsed = new Date(
    `${date}T00:00:00Z`
  );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    return null;
  }

  return date;
}

/* =========================================================
   GET ACTIVE PACKAGE IDS
========================================================= */

export function getActivePackageIds(
  activePlansResponse
) {
  if (activePlansResponse?.status !== true) {
    return [];
  }

  const plans = Array.isArray(
    activePlansResponse?.data
  )
    ? activePlansResponse.data
    : [];

  const today = getTodayInIndia();

  const ids = plans
    .filter((plan) => {
      const active =
        isActiveStatus(plan?.status) &&
        isActiveStatus(
          plan?.premium_status ??
          plan?.premiumStatus
        );

      if (!active) return false;

      const start = normalizeDate(
        plan?.starting_date ??
        plan?.start_date ??
        plan?.valid_from
      );

      const expiry = normalizeDate(
        plan?.expiry_date ??
        plan?.expiryDate ??
        plan?.valid_until
      );

      return Boolean(
        start &&
        expiry &&
        today >= start &&
        today <= expiry
      );
    })
    .map((plan) =>
      normalizePackageId(
        plan?.pid ??
        plan?.package_id ??
        plan?.packageId
      )
    )
    .filter(Boolean);

  return [...new Set(ids)];
}

/* =========================================================
   CHECK SPECIFIC PURCHASED PACKAGE
========================================================= */

export function hasActivePackage(
  activePlansResponse,
  requiredPackageIds
) {
  const required = Array.isArray(
    requiredPackageIds
  )
    ? requiredPackageIds
    : [requiredPackageIds];

  const requiredIds = new Set(
    required
      .map(normalizePackageId)
      .filter(Boolean)
  );

  if (!requiredIds.size) {
    return false;
  }

  const activeIds = getActivePackageIds(
    activePlansResponse
  );

  return activeIds.some((id) =>
    requiredIds.has(id)
  );
}
