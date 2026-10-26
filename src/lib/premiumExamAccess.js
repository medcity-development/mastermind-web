import "server-only";

import { getMockTestDetails } from "@/lib/pscApi";
import { getOwnedPackages, getOwnedExamIds, packageIncludesExam } from "@/lib/packageAccess";

function getExamDetails(result) {
  if (Array.isArray(result?.exam)) {
    return result.exam[0] ?? null;
  }

  return result?.exam && typeof result.exam === "object"
    ? result.exam
    : null;
}

function isSuccessfulApiStatus(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  return ["1", "true"].includes(
    String(value).trim().toLowerCase()
  );
}

export async function checkPremiumExamAccess({
  uid = 0,
  cid,
  examId,
  type = "mock",
  exam: examOverride = null,
} = {}) {
  let exam = examOverride;

  if (!exam) {
    const details = await getMockTestDetails({
      uid,
      cid,
      examId,
      type,
    });

    const rawStatus = details?.raw?.status;

    if (
      !details?.status ||
      !isSuccessfulApiStatus(rawStatus)
    ) {
      throw new Error(
        details?.message || "Unable to verify exam access."
      );
    }

    exam = getExamDetails(details);
  }

  const examAccess = String(exam?.access ?? "")
    .trim()
    .toLowerCase();

  if (!exam || !["free", "paid"].includes(examAccess)) {
    throw new Error("The exam access status could not be verified.");
  }

  const isPremium = examAccess === "paid";

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

  const purchasedPackages = await getOwnedPackages(uidNumber, Number(cid));

  const directAccess = purchasedPackages.some(({ details }) => packageIncludesExam(details, exam));
  const hasAccess = directAccess || (await getOwnedExamIds(uidNumber, Number(cid), type)).has(String(exam.id ?? examId));
  return {
    isPremium: true,
    hasAccess,
    exam,
  };
}
