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
  const type = cleanText(
    item?._examType ??
    item?.exam_type ??
    item?.examType ??
    item?.type ??
    item?.lastposition ??
    ""
  ).toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

  const aliases = {
    "mock test": "mock",
    pyq: "pqp",
    twe: "topicwise",
    "topic wise": "topicwise",
    "study plan": "studyplan",
  };

  return aliases[type] || type.replace(/\s+/g, "");
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

  if (normalized === "pqp" || normalized === "pyq") {
    return "PYQ";
  }
  if (normalized === "scert") {
    return "SCERT";
  }
  if (normalized === "twe" || normalized === "topicwise") {
    return "Topic Wise";
  }
  if (normalized === "studyplan" || normalized === "study_plan") {
    return "Study Plan";
  }
  if (normalized === "mock") {
    return "Mock";
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

const EXAM_TIME_ZONE = "Asia/Kolkata";

function parseExamDate(value) {
  const raw = cleanText(value);
  if (!raw || raw === "-" || raw === "—" || /^0{4}-0{2}-0{2}/.test(raw) || raw === "0" || raw === "null" || raw === "undefined") {
    return null;
  }

  // 1. Numeric timestamp (seconds or ms)
  if (/^\d{10,13}$/.test(raw)) {
    const numericTimestamp = Number(raw);
    const milliseconds =
      raw.length === 10 ? numericTimestamp * 1000 : numericTimestamp;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // 2. Format: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const normalized = raw.includes("T")
      ? raw
      : raw.replace(" ", "T");
    const hasExplicitTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
    const isLocalIsoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalized);
    const dateValue = hasExplicitTimeZone
      ? normalized
      : isDateOnly
        ? `${normalized}T00:00:00+05:30`
        : isLocalIsoDateTime
          ? `${normalized}+05:30`
          : normalized;
    const date = new Date(dateValue);
    if (!Number.isNaN(date.getTime())) return date;
  }

  // 3. Format: "11-Oct-2026 09:32 pm" or "11-Oct-2026 21:32:00"
  const ddMonYyyyMatch = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
  if (ddMonYyyyMatch) {
    const [, day, monStr, year, hStr, mStr, sStr, meridiem] = ddMonYyyyMatch;
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIdx = monthNames.indexOf(monStr.toLowerCase());
    if (monthIdx !== -1) {
      let hour = hStr ? Number(hStr) : 0;
      const min = mStr ? Number(mStr) : 0;
      const sec = sStr ? Number(sStr) : 0;
      if (meridiem) {
        const m = meridiem.toLowerCase();
        if (m === "pm" && hour < 12) hour += 12;
        if (m === "am" && hour === 12) hour = 0;
      }
      const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}+05:30`;
      const date = new Date(iso);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  // 4. Format: "09:32 pm, Oct 11, 2026"
  const hhMmMonYyyyMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm),\s*([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/i);
  if (hhMmMonYyyyMatch) {
    const [, hStr, mStr, sStr, meridiem, monStr, day, year] = hhMmMonYyyyMatch;
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIdx = monthNames.indexOf(monStr.toLowerCase());
    if (monthIdx !== -1) {
      let hour = Number(hStr);
      const min = Number(mStr);
      const sec = sStr ? Number(sStr) : 0;
      if (meridiem) {
        const m = meridiem.toLowerCase();
        if (m === "pm" && hour < 12) hour += 12;
        if (m === "am" && hour === 12) hour = 0;
      }
      const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}+05:30`;
      const date = new Date(iso);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  // 5. Standard fallback
  const fallbackDate = new Date(raw);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function getIstParts(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: EXAM_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

export function formatExamDate(
  value
) {
  const raw = cleanText(value);
  if (!raw || raw === "-" || raw === "—" || /^0{4}-0{2}-0{2}/.test(raw)) {
    return "—";
  }

  const date = parseExamDate(raw);
  if (!date) {
    return raw;
  }

  const parts = getIstParts(date);
  const hour12 = parts.hour % 12 || 12;
  const meridiem = parts.hour < 12 ? "AM" : "PM";

  return `${parts.day} ${parts.month} ${parts.year}, ${String(hour12).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")} ${meridiem}`;
}

function getTimestamp(value, source) {
  return { value: value || null, source: value ? source : "missing" };
}

export function getAttemptStartTimestamp(attempt) {
  return getTimestamp(
    attempt?.start_time ??
      attempt?.startTime ??
      attempt?.started_at ??
      attempt?.startedAt ??
      attempt?.starttime ??
      attempt?.created_at ??
      attempt?.createdAt ??
      attempt?.created_date ??
      attempt?.createdDate ??
      attempt?.created ??
      attempt?.date ??
      attempt?.exam_date ??
      attempt?.examDate ??
      attempt?.datetime ??
      attempt?.date_time,
    "start"
  );
}

export function getAttemptEndTimestamp(attempt) {
  let value =
    attempt?.completed_at ??
    attempt?.completedAt ??
    attempt?.complete_time ??
    attempt?.completed_time ??
    attempt?.finish_time ??
    attempt?.finishTime ??
    attempt?.finished_at ??
    attempt?.finishedAt ??
    attempt?.submitted_at ??
    attempt?.submittedAt ??
    attempt?.submission_time ??
    attempt?.end_time ??
    attempt?.endTime ??
    attempt?.endtime ??
    attempt?.ended_at ??
    attempt?.endedAt ??
    attempt?.modified_at ??
    attempt?.modifiedAt ??
    attempt?.updated_at ??
    attempt?.updatedAt ??
    attempt?.updatetime ??
    attempt?.modify_time;

  if (value && (/^0{4}-0{2}-0{2}/.test(String(value)) || value === "0" || value === "null" || value === "undefined")) {
    value = null;
  }

  // Fallback: If modified_at is omitted by backend, derive completed time from start time + paused_time
  if (!value) {
    const startVal = getAttemptStartTimestamp(attempt).value;
    const rawPaused = attempt?.paused_time ?? attempt?.time_taken;
    const rawDuration = rawPaused !== undefined && rawPaused !== null && rawPaused !== ""
      ? Number(rawPaused)
      : null;

    if (startVal && Number.isFinite(rawDuration) && rawDuration > 0) {
      const startDate = parseExamDate(startVal);
      if (startDate) {
        let durationMs = 0;
        if (rawDuration >= 1_000_000_000) {
          // Absolute Unix timestamp
          const absDate = new Date(rawDuration < 1e12 ? rawDuration * 1000 : rawDuration);
          if (!Number.isNaN(absDate.getTime())) {
            return getTimestamp(absDate.toISOString(), "completed");
          }
        } else if (rawDuration > 86_400) {
          // Milliseconds (e.g. 4,229,040 ms = ~70 min)
          durationMs = rawDuration;
        } else {
          // Seconds (e.g. 4,294 s = ~71.5 min, or 473 s = ~7.8 min)
          durationMs = rawDuration * 1000;
        }

        const endDate = new Date(startDate.getTime() + durationMs);
        value = endDate.toISOString();
      }
    }
  }

  return getTimestamp(value, "completed");
}

export function getAttemptStartTime(attempt) {
  return formatExamDate(getAttemptStartTimestamp(attempt).value);
}

export function getAttemptEndTime(attempt) {
  return formatExamDate(getAttemptEndTimestamp(attempt).value);
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
  const standardTypes = [
    { key: "mock", label: "Mock", count: 0 },
    { key: "pqp", label: "PYQ", count: 0 },
    { key: "scert", label: "SCERT", count: 0 },
    { key: "topicwise", label: "Topic Wise", count: 0 },
    { key: "studyplan", label: "Study Plan", count: 0 },
  ];
  const typeMap = new Map(
    standardTypes.map((type) => [type.key, type])
  );

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
    item?.end_time,
    item?.endTime,
    item?.ended_at,
    item?.endedAt,

    item?.modified_at,
    item?.modifiedAt,

    item?.updated_at,
    item?.updatedAt,

    item?.created_at,
    item?.createdAt,

    item?.start_time,
    item?.startTime,
  ];

  for (
    const candidate of candidates
  ) {
    if (!candidate) {
      continue;
    }

    const date = parseExamDate(candidate);
    if (date) {
      return date.getTime();
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
