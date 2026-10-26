
/* =========================================================
   MASTERMIND ACADEMY
   VIDEO ACCESS UTILITIES
========================================================= */

import {
  hasActivePackage,
} from "@/lib/packageAccessUtils";

export const VIDEO_PREVIEW_SECONDS = 240;

/* =========================================================
   VIDEO TYPE
========================================================= */

export function isPaidVideo(video) {
  const type = String(
    video?.accessType ??
    video?.access_type ??
    video?.type ??
    video?.access ??
    "paid"
  )
    .trim()
    .toLowerCase();

  return !["free", "public", "0", "false"].includes(
    type
  );
}

/* =========================================================
   REQUIRED PACKAGE IDS
========================================================= */

function getRequiredPackageIds(video) {
  const raw =
    video?.requiredPackageIds ??
    video?.packageIds ??
    video?.package_ids ??
    video?.requiredPackageId ??
    video?.package_id ??
    video?.pid ??
    null;

  if (Array.isArray(raw)) {
    return raw.filter(Boolean);
  }

  if (
    raw === null ||
    raw === undefined ||
    raw === ""
  ) {
    return [];
  }

  return [raw];
}

/* =========================================================
   VIDEO ACCESS
========================================================= */

export function getVideoAccess({
  video,
  activePlans = null,
  verifiedPackageAccess = false,
} = {}) {
  if (!video) {
    return {
      isPaid: false,
      fullAccess: false,
      previewRequired: false,
      previewSeconds: 0,
    };
  }

  const isPaid = isPaidVideo(video);

  if (!isPaid) {
    return {
      isPaid: false,
      fullAccess: true,
      previewRequired: false,
      previewSeconds: 0,
    };
  }

  const requiredPackageIds =
    getRequiredPackageIds(video);

  const purchasedPackageMatches =
    requiredPackageIds.length > 0 &&
    hasActivePackage(
      activePlans,
      requiredPackageIds
    );

  const hasAccess =
    verifiedPackageAccess === true ||
    video?.packageAccess === true ||
    purchasedPackageMatches;

  return {
    isPaid: true,
    fullAccess: hasAccess,
    previewRequired: !hasAccess,
    previewSeconds: hasAccess
      ? 0
      : VIDEO_PREVIEW_SECONDS,
  };
}
