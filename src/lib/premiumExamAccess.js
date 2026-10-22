import "server-only";

import { getMockTestDetails } from "@/lib/pscApi";
import { getPackagesList } from "@/lib/packagesHelper";

function getExamDetails(result) {
  if (Array.isArray(result?.exam)) {
    return result.exam[0] ?? null;
  }

  return result?.exam && typeof result.exam === "object"
    ? result.exam
    : null;
}

export async function checkPremiumExamAccess({
  uid = 0,
  cid,
  examId,
  type = "mock",
} = {}) {
  const details = await getMockTestDetails({
    uid,
    cid,
    examId,
    type,
  });

  if (!details?.status) {
    throw new Error(
      details?.message || "Unable to verify exam access."
    );
  }

  const exam = getExamDetails(details);
  const isPremium =
    String(exam?.access ?? "").trim().toLowerCase() === "paid";

  if (!isPremium) {
    return {
      isPremium: false,
      hasAccess: true,
      exam,
    };
  }

  const uidNumber = Number(uid);

  if (!Number.isSafeInteger(uidNumber) || uidNumber <= 0) {
    return {
      isPremium: true,
      hasAccess: false,
      exam,
    };
  }

  const packageResult = await getPackagesList({
    uid: uidNumber,
    cid,
    throwOnError: true,
    includeActivePacks: true,
  });

  return {
    isPremium: true,
    hasAccess: packageResult.activePacks.length > 0,
    exam,
  };
}
