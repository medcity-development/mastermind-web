import "server-only";

import {
  isCurrentPlan,
} from "@/lib/packageAccess";
import { getActivePlans } from "@/lib/packagesHelper";

function normalizeId(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(text)) {
    return null;
  }

  const id = Number(text);

  return Number.isSafeInteger(id) ? id : null;
}

function findPackageId(item) {
  return normalizeId(
    item?.pid ??
    item?.package_id ??
    item?.packageId ??
    item?.plan?.pid ??
    item?.plan?.package_id
  );
}

function getExpiryDate(item) {
  const plan = item?.plan ?? item;

  return (
    plan?.expiry_date ??
    plan?.expiryDate ??
    plan?.valid_until ??
    null
  );
}

export async function checkPackagePurchaseEligibility({
  uid,
  cid,
  pid,
}) {
  const userId = normalizeId(uid);
  const categoryId = normalizeId(cid);
  const packageId = normalizeId(pid);

  if (!userId || !categoryId || !packageId) {
    return {
      allowed: false,
      reason: "INVALID_REQUEST",
      message: "Invalid student or package details.",
    };
  }

  try {
    // Duplicate-purchase protection needs the subscription itself, not
    // a successful content-details request for every purchased package.
    const ownedPackages = await getActivePlans({ uid: userId, cid: categoryId });

    if (!Array.isArray(ownedPackages)) {
      return {
        allowed: false,
        reason: "OWNERSHIP_VERIFICATION_FAILED",
        message:
          "Unable to verify your existing subscriptions.",
      };
    }

    const activePackage = ownedPackages.find(
      (item) => findPackageId(item) === packageId &&
        isCurrentPlan(item) &&
        (item.cid == null || item.cid === "" || Number(item.cid) === categoryId)
    );

    if (activePackage) {
      return {
        allowed: false,
        reason: "ALREADY_ACTIVE",
        message:
          "You have already purchased this package.",
        packageId: String(packageId),
        expiryDate: getExpiryDate(activePackage),
        plan: activePackage.plan ?? activePackage,
      };
    }

    return {
      allowed: true,
      reason: "ELIGIBLE",
      message: "You can purchase this package.",
      packageId: String(packageId),
    };
  } catch (error) {
    console.error(
      "Package purchase eligibility failed:",
      error?.message
    );

    return {
      allowed: false,
      reason: "OWNERSHIP_VERIFICATION_FAILED",
      message:
        "Unable to verify your subscriptions. Please try again.",
    };
  }
}
