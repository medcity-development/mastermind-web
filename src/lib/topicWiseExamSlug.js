export function normalizeTopicWiseExamSlug(value) {
  const slug = String(value ?? "");

  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug.normalize("NFC");
  }
}

export function getTopicWiseExamSlug(exam) {
  const titleSlug = String(
    exam?.exam_name || exam?.title || ""
  )
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (titleSlug && !/^\d+$/.test(titleSlug)) return titleSlug;

  const examId = String(exam?.id ?? "").trim();
  return /^\d+$/.test(examId)
    ? `exam-${examId}`
    : "topic-exam";
}
