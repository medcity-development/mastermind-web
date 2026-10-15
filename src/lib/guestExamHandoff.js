const STORAGE_KEY = "mastermind_guest_exam_handoff";
const MAX_AGE = 24 * 60 * 60 * 1000;

export function saveGuestExamHandoff(attempt) {
  if (typeof window === "undefined") {
    throw new Error("Exam progress requires a browser.");
  }

  if (
    !attempt?.examId ||
    !attempt?.examType ||
    !["pause", "submit"].includes(attempt.action) ||
    !attempt.answers ||
    typeof attempt.answers !== "object" ||
    Array.isArray(attempt.answers)
  ) {
    throw new Error("Guest exam progress is incomplete.");
  }

  const value = {
    ...attempt,
    examId: String(attempt.examId),
    examType: String(attempt.examType).toLowerCase(),
    governmentExamsSlug: String(
      attempt.governmentExamsSlug || ""
    ),
    savedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(value)
    );
  } catch {
    throw new Error(
      "Unable to preserve your answers. Allow browser storage and try Finish again."
    );
  }

  return value;
}

export function readGuestExamHandoff({
  examId,
  examType,
  governmentExamsSlug,
}) {
  if (typeof window === "undefined") {
    return null;
  }

  let raw;

  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error(
      "Saved exam progress cannot be accessed."
    );
  }

  if (!raw) return null;

  let value;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      "Saved exam progress is corrupted."
    );
  }

  if (
    String(value.examId) !== String(examId) ||
    String(value.examType).toLowerCase() !==
    String(examType).toLowerCase() ||
    (
      governmentExamsSlug &&
      value.governmentExamsSlug !== governmentExamsSlug
    )
  ) {
    return null;
  }

  if (
    !Number.isFinite(value.savedAt) ||
    Date.now() - value.savedAt > MAX_AGE
  ) {
    throw new Error(
      "Saved guest exam progress has expired."
    );
  }

  return value;
}

export function guestExamLoginRedirectPath(action) {
  if (
    typeof window === "undefined" ||
    !["pause", "submit"].includes(action)
  ) {
    throw new Error("Invalid exam action.");
  }

  const destination = new URL(window.location.href);

  destination.searchParams.set("guestAction", action);

  return (
    destination.pathname +
    destination.search +
    destination.hash
  );
}

export function clearGuestExamHandoff() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}