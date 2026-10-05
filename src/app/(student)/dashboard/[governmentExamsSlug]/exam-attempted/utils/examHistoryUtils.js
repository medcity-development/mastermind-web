/* =========================================================
   TEXT
========================================================= */

export function cleanText(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

/* =========================================================
   ATTEMPT ID
========================================================= */

export function getAttemptId(
  item
) {
  return (
    item?.id ??
    item?.pauseid ??
    item?.pause_id ??
    item?.attempt_id ??
    item?.attemptId ??
    null
  );
}

/* =========================================================
   EXAM ID
========================================================= */

export function getExamId(
  item
) {
  return (
    item?.exam_id ??
    item?.examId ??
    item?.test_id ??
    item?.testId ??
    null
  );
}

/* =========================================================
   EXAM TYPE
========================================================= */

export function getAttemptExamType(
  item
) {
  return cleanText(
    item?._examType ??
    item?.exam_type ??
    item?.examType ??
    item?.type ??
    item?.lastposition ??
    ""
  ).toLowerCase();
}

/* =========================================================
   EXAM NAME

   Priority:
   1. Name resolved by history API
   2. Name directly returned by backend
   3. Other possible backend name fields

   Never create:
   Exam 68
   Mock Test #68
========================================================= */

export function getAttemptExamName(
  item
) {
  const candidates = [
    item?._resolvedExamName,

    item?.exam_name,
    item?.examName,

    item?.exam_title,
    item?.examTitle,

    item?.test_name,
    item?.testName,

    item?.mock_name,
    item?.mockName,

    item?.qp_name,
    item?.qpName,
    item?.qpname,

    item?.question_paper_name,
    item?.questionPaperName,

    item?.title,
    item?.name,
  ];

  for (
    const candidate of candidates
  ) {
    const value =
      cleanText(
        candidate
      );

    if (value) {
      return value;
    }
  }

  return "-";
}

/* =========================================================
   TYPE LABEL

   Do not depend on hardcoded history tabs here.
   Convert actual API type into readable text.
========================================================= */

export function getExamTypeLabel(
  type
) {
  const normalized =
    cleanText(
      type
    ).toLowerCase();

  if (!normalized) {
    return "-";
  }

  return normalized
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

/* =========================================================
   NUMBER
========================================================= */

export function formatResultNumber(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "0";
  }

  if (
    Number.isInteger(
      number
    )
  ) {
    return String(
      number
    );
  }

  return String(
    Number(
      number.toFixed(2)
    )
  );
}

/* =========================================================
   DATE
========================================================= */

export function formatExamDate(
  value
) {
  if (!value) {
    return "-";
  }

  const raw =
    cleanText(
      value
    );

  if (!raw) {
    return "-";
  }

  const normalized =
    raw.includes("T")
      ? raw
      : raw.replace(
        " ",
        "T"
      );

  const date =
    new Date(
      normalized
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return raw;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  ).format(date);
}

/* =========================================================
   RESPONSE LIST
========================================================= */

export function getResponseList(
  response
) {
  if (
    Array.isArray(
      response?.details
    )
  ) {
    return response.details;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  return [];
}

/* =========================================================
   NORMALIZE ATTEMPTS
========================================================= */

export function normalizeAttemptList({
  response,
  examType = "",
}) {
  const list =
    getResponseList(
      response
    );

  return list.map(
    (
      item,
      index
    ) => {
      const attemptId =
        getAttemptId(
          item
        );

      const resolvedType =
        getAttemptExamType(
          item
        ) ||
        cleanText(
          examType
        ).toLowerCase();

      return {
        ...item,

        _examType:
          resolvedType,

        _historyId:
          `${resolvedType ||
          "exam"
          }-${attemptId ??
          index
          }`,
      };
    }
  );
}

/* =========================================================
   DYNAMIC HISTORY TYPES

   Types come from loaded attempts.
   Nothing is hardcoded.
========================================================= */

export function getDynamicExamTypes(
  attempts = []
) {
  const typeMap =
    new Map();

  attempts.forEach(
    (attempt) => {
      const key =
        getAttemptExamType(
          attempt
        );

      if (!key) {
        return;
      }

      if (
        !typeMap.has(
          key
        )
      ) {
        typeMap.set(
          key,
          {
            key,

            label:
              getExamTypeLabel(
                key
              ),

            count: 0,
          }
        );
      }

      const current =
        typeMap.get(
          key
        );

      current.count +=
        1;
    }
  );

  return Array.from(
    typeMap.values()
  );
}

/* =========================================================
   HISTORY TABS
========================================================= */

export function buildExamHistoryTabs(
  attempts = []
) {
  const dynamicTypes =
    getDynamicExamTypes(
      attempts
    );

  return [
    {
      key:
        "all",

      label:
        "All Exams",

      count:
        attempts.length,
    },

    ...dynamicTypes,
  ];
}

/* =========================================================
   FILTER ATTEMPTS
========================================================= */

export function filterExamHistory({
  attempts = [],
  activeTab = "all",
  search = "",
}) {
  const normalizedSearch =
    cleanText(
      search
    ).toLowerCase();

  return attempts.filter(
    (attempt) => {
      const type =
        getAttemptExamType(
          attempt
        );

      if (
        activeTab !==
        "all" &&
        type !==
        activeTab
      ) {
        return false;
      }

      if (
        !normalizedSearch
      ) {
        return true;
      }

      const examName =
        getAttemptExamName(
          attempt
        )
          .toLowerCase();

      const typeLabel =
        getExamTypeLabel(
          type
        )
          .toLowerCase();

      return (
        examName.includes(
          normalizedSearch
        ) ||
        typeLabel.includes(
          normalizedSearch
        )
      );
    }
  );
}

/* =========================================================
   ATTEMPT TIMESTAMP
========================================================= */

export function getAttemptTimestamp(
  item
) {
  const candidates = [
    item?.modified_at,
    item?.modifiedAt,

    item?.updated_at,
    item?.updatedAt,

    item?.created_at,
    item?.createdAt,

    item?.end_time,
    item?.endTime,

    item?.start_time,
    item?.startTime,
  ];

  for (
    const candidate of candidates
  ) {
    if (!candidate) {
      continue;
    }

    const raw =
      cleanText(
        candidate
      );

    const normalized =
      raw.includes("T")
        ? raw
        : raw.replace(
          " ",
          "T"
        );

    const timestamp =
      new Date(
        normalized
      ).getTime();

    if (
      Number.isFinite(
        timestamp
      )
    ) {
      return timestamp;
    }
  }

  return 0;
}

/* =========================================================
   SORT NEWEST FIRST
========================================================= */

export function sortAttemptsNewestFirst(
  attempts = []
) {
  if (
    !Array.isArray(
      attempts
    )
  ) {
    return [];
  }

  return [
    ...attempts,
  ].sort(
    (
      first,
      second
    ) =>
      getAttemptTimestamp(
        second
      ) -
      getAttemptTimestamp(
        first
      )
  );
}