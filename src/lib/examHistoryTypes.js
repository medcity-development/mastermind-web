const TYPE_ALIASES = {
  mock: "mock",
  mocktest: "mock",
  "mock test": "mock",

  pyq: "pqp",
  pqp: "pqp",

  scert: "scert",

  twe: "topicwise",
  topicwise: "topicwise",
  "topic-wise": "topicwise",
  "topic wise": "topicwise",
  topic_wise: "topicwise",

  studyplan: "studyplan",
  "study-plan": "studyplan",
  "study plan": "studyplan",
  study_plan: "studyplan",
};

const TYPE_LABELS = {
  mock: "Mock",
  pqp: "PYQ",
  scert: "SCERT",
  topicwise: "Topic Wise",
  studyplan: "Study Plan",
};

export const ENABLED_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
  "studyplan",
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

export function getDynamicExamTypes(
  attempts = []
) {
  if (!Array.isArray(attempts)) {
    return [];
  }

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

export function buildExamHistoryTabs(
  attempts = []
) {
  const records = Array.isArray(attempts)
    ? attempts.filter((attempt) =>
        ENABLED_TYPES.includes(
          getAttemptExamType(attempt)
        )
      )
    : [];

  const counts = Object.fromEntries(
    ENABLED_TYPES.map((type) => [type, 0])
  );

  for (const attempt of records) {
    const type = getAttemptExamType(attempt);
    counts[type] += 1;
  }

  return [
    {
      id: "all",
      key: "all",
      value: "all",
      label: "All Exams",
      count: records.length,
    },

    ...ENABLED_TYPES.map((type) => ({
      id: type,
      key: type,
      value: type,
      label: getExamTypeLabel(type),
      count: counts[type],
    })),
  ];
}