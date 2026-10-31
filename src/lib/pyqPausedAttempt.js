
function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

function extractRows(value) {
  if (Array.isArray(value)) {
    return value.flatMap(extractRows);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const attemptId = positiveId(
    value.pauseid ??
    value.pause_id ??
    value.attempt_id ??
    value.id
  );

  if (attemptId) {
    return [value];
  }

  return [
    "data",
    "details",
    "result",
    "results",
    "exams",
    "paused",
  ].flatMap((key) => extractRows(value[key]));
}

export function selectPyqPausedAttempt(
  result,
  { examId, uid, cid }
) {
  const expectedExamId = positiveId(examId);
  const expectedUid = positiveId(uid);
  const expectedCid = positiveId(cid);

  if (!expectedExamId || !expectedUid) {
    return null;
  }

  const candidates = extractRows(result).filter(
    (row) => {
      const rowExamId = positiveId(
        row.exam_id ?? row.examId
      );

      const rowUid = positiveId(
        row.uid ?? row.user_id
      );

      const rowCid = positiveId(
        row.cid ?? row.course_id
      );

      const rowType = String(
        row.exam_type ?? row.examType ?? ""
      )
        .trim()
        .toLowerCase();

      return (
        rowExamId === expectedExamId &&
        rowUid === expectedUid &&
        ["pqp", "pyq"].includes(rowType) &&
        (
          !expectedCid ||
          !rowCid ||
          rowCid === expectedCid
        )
      );
    }
  );

  candidates.sort((a, b) => {
    const getId = (row) =>
      positiveId(
        row.pauseid ??
        row.pause_id ??
        row.attempt_id ??
        row.id
      ) ?? 0;

    return getId(b) - getId(a);
  });

  const latest = candidates[0];

  if (!latest) {
    return null;
  }

  const status = String(
    latest.exam_status ??
    latest.examStatus ??
    ""
  )
    .trim()
    .toLowerCase();

  return ["pause", "paused"].includes(status)
    ? latest
    : null;
}
