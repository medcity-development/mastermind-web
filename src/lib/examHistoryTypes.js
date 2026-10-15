
const TYPE_ALIASES = {
  mock: "mock",
  pyq: "pqp",
  pqp: "pqp",
  scert: "scert",
  twe: "topicwise",
  topicwise: "topicwise",
  "topic-wise": "topicwise",
};

const TYPE_LABELS = {
  mock: "Mock",
  pqp: "PYQ",
  scert: "SCERT",
  topicwise: "Topic Wise",
};

const ENABLED_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
];

export function normalizeExamHistoryType(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();

  return TYPE_ALIASES[key] || key;
}

export function getAttemptExamType(attempt) {
  return normalizeExamHistoryType(
    attempt?._examType ??
    attempt?.exam_type ??
    attempt?.examType ??
    attempt?.type ??
    attempt?.lastposition ??
    ""
  );
}

export function getDynamicExamTypes(attempts = []) {
  if (!Array.isArray(attempts)) return [];

  const found = new Set(
    attempts.map(getAttemptExamType)
  );

  return ENABLED_TYPES.filter((type) =>
    found.has(type)
  );
}

export function getExamHistoryTypes(attempts) {
  return Array.isArray(attempts)
    ? getDynamicExamTypes(attempts)
    : [...ENABLED_TYPES];
}

export function getExamTypeLabel(value) {
  const type = normalizeExamHistoryType(value);

  return (
    TYPE_LABELS[type] ||
    type.replace(/[-_]/g, " ")
  );
}

export function buildExamHistoryTabs(attempts = []) {
  const records = Array.isArray(attempts)
    ? attempts.filter((attempt) =>
        ENABLED_TYPES.includes(
          getAttemptExamType(attempt)
        )
      )
    : [];

  return [
    {
      id: "all",
      value: "all",
      label: "All Exams",
      count: records.length,
    },

    ...ENABLED_TYPES.map((type) => ({
      id: type,
      value: type,
      label: getExamTypeLabel(type),
      count: records.filter(
        (attempt) =>
          getAttemptExamType(attempt) === type
      ).length,
    })),
  ];
}
