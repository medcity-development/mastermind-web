
import {
  getAttemptExamType,
  sortAttemptsNewestFirst,
} from "./examHistoryUtils";

import { prepareExamHistoryResult } from "@/lib/examHistoryResult";
import { recoverPyqHistory } from "@/lib/pyqHistoryRecovery";
import { isFinishedExamAttempt } from "@/lib/examAttemptStatus";

export const ITEMS_PER_PAGE = 10;

export const HISTORY_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "tst",
  "studyplan",
];

const TYPE_ALIASES = {
  pyq: "pqp",
  twe: "topicwise",
  "topic-wise": "topicwise",
  "topic wise": "topicwise",
  topic_wise: "topicwise",
  statement: "tst",
  statementtype: "tst",
  "statement-type": "tst",
  "statement type": "tst",
  mocktest: "mock",
  "mock test": "mock",
  "study-plan": "studyplan",
  "study plan": "studyplan",
  study_plan: "studyplan",
};

export function normalizeType(value) {
  const type = String(value ?? "").trim().toLowerCase();
  return TYPE_ALIASES[type] || type;
}

export function positiveId(value) {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function firstId(...values) {
  for (const value of values) {
    const id = positiveId(value);
    if (id !== null) return id;
  }
  return null;
}

export function examIdOf(row) {
  return firstId(
    row?._examId,
    row?.exam_id,
    row?.examId,
    row?.examid,
    row?.test_id,
    row?.testId
  );
}

export function attemptIdOf(row) {
  return firstId(
    row?._historyId,
    row?.attempt_id,
    row?.attemptId,
    row?.pauseid,
    row?.pause_id,
    row?.id
  );
}

const INVALID_NAMES = new Set([
  "",
  "-",
  "—",
  "null",
  "undefined",
  "unknown",
  "n/a",
  "exam name unavailable",
  "exam name not available",
  "untitled exam",
]);

export function validName(value) {
  if (typeof value !== "string") return "";

  const name = value.trim();

  return INVALID_NAMES.has(name.toLowerCase())
    ? ""
    : name;
}

export function resolveName(row) {
  const candidates = [
    row?._resolvedExamName,
    row?.exam_name,
    row?.examName,
    row?.exam_title,
    row?.examTitle,
    row?.test_name,
    row?.testName,
    row?.test_title,
    row?.mock_name,
    row?.title,
    row?.name,
    row?.exam?.exam_name,
    row?.exam?.title,
  ];

  for (const candidate of candidates) {
    const name = validName(candidate);
    if (name) return name;
  }

  return "";
}

export function nameKey(cid, row) {
  const examId = examIdOf(row);

  const type = normalizeType(
    row?._examType ??
      row?.exam_type ??
      getAttemptExamType(row)
  );

  if (!positiveId(cid) || !examId || !HISTORY_TYPES.includes(type)) {
    return null;
  }

  return `${cid}:${type}:${examId}`;
}

export function normalizeRecord(record, requestedType) {
  const type = normalizeType(requestedType);

  const source =
    type === "pqp"
      ? recoverPyqHistory(record)
      : record;

  const prepared = prepareExamHistoryResult(source);

  const normalized = {
    ...source,
    ...prepared,
  };

  if (!isFinishedExamAttempt(source)) {
    for (const field of [
      "total_attempted",
      "total_correct",
      "total_wrong",
      "attempted_count",
      "correct_count",
      "wrong_count",
      "user_score",
      "score",
      "minus_mark",
      "marks_obtained",
      "negative_mark",
    ]) {
      normalized[field] = null;
    }
  } else {
    for (const field of [
      "total_attempted",
      "total_correct",
      "total_wrong",
      "user_score",
      "score",
      "minus_mark",
    ]) {
      const saved = source?.[field];

      if (saved !== null && saved !== undefined && saved !== "") {
        normalized[field] = saved;
      }
    }
  }

  const attemptId = attemptIdOf(record);
  const examId = examIdOf(record);
  const name = resolveName(normalized) || resolveName(record);

  return {
    ...normalized,
    exam_type: type,
    _examType: type,
    ...(attemptId ? { _historyId: attemptId } : {}),
    ...(examId ? { _examId: examId } : {}),
    _resolvedExamName: name,
    ...(name ? { exam_name: name } : {}),
  };
}

export function uniqueAttempts(records) {
  const unique = new Map();
  let fallbackIndex = 0;

  for (const record of records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      continue;
    }

    const type = normalizeType(getAttemptExamType(record));
    const attemptId = attemptIdOf(record);

    const key = attemptId
      ? `${type}:${attemptId}`
      : `${type}:row:${fallbackIndex++}`;

    const previous = unique.get(key);

    if (!previous) {
      unique.set(key, record);
      continue;
    }

    const currentName = resolveName(record);
    const previousName = resolveName(previous);

    unique.set(key, {
      ...previous,
      ...record,
      ...(!currentName && previousName
        ? {
            exam_name: previousName,
            _resolvedExamName: previousName,
          }
        : {}),
    });
  }

  return sortAttemptsNewestFirst([...unique.values()]);
}
