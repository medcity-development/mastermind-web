
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import ExamHistoryHeader from "./components/ExamHistoryHeader";
import ExamHistoryTabs from "./components/ExamHistoryTabs";
import AttemptedExamTable from "./components/AttemptedExamTable";
import ExamHistoryPagination from "./components/ExamHistoryPagination";

import {
  buildExamHistoryTabs,
  getAttemptExamName,
  getAttemptExamType,
  normalizeAttemptList,
  sortAttemptsNewestFirst,
} from "./utils/examHistoryUtils";

import {
  prepareExamHistoryResult,
} from "@/lib/examHistoryResult";

import {
  recoverPyqHistory,
} from "@/lib/pyqHistoryRecovery";
import { isFinishedExamAttempt } from "@/lib/examAttemptStatus";

const ITEMS_PER_PAGE = 10;

// Study Plan intentionally disabled.
const HISTORY_TYPES = [
  "mock",
  "pqp",
  "scert",
  "topicwise",
];

const TYPE_ALIASES = {
  pyq: "pqp",
  twe: "topicwise",
  "topic-wise": "topicwise",
};

const nameCache = new Map();
const nameRequests = new Map();

let nameCooldownUntil = 0;

function normalizeType(value) {
  const type = String(value ?? "")
    .trim()
    .toLowerCase();

  return TYPE_ALIASES[type] || type;
}

function validName(value) {
  if (typeof value !== "string") {
    return "";
  }

  const name = value.trim();

  const invalid = new Set([
    "",
    "-",
    "—",
    "null",
    "undefined",
    "unknown",
    "exam name unavailable",
  ]);

  return invalid.has(name.toLowerCase())
    ? ""
    : name;
}

function resolveName(record) {
  const candidates = [
    record?._resolvedExamName,
    record?.exam_name,
    record?.examName,
    record?.exam_title,
    record?.examTitle,
    record?.test_name,
    record?.test_title,
    record?.title,
    record?.name,
    record?.exam?.exam_name,
    record?.exam?.title,
    record?.exam_details?.exam_name,
    record?.exam_details?.title,
    getAttemptExamName(record),
  ];

  for (const candidate of candidates) {
    const name = validName(candidate);

    if (name) {
      return name;
    }
  }

  return "";
}

function positiveId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) &&
    number > 0
    ? number
    : null;
}

function examIdOf(record) {
  return positiveId(
    record?.exam_id ??
    record?.examId ??
    record?.examid ??
    record?.test_id ??
    record?.testId
  );
}

function attemptIdOf(record) {
  return positiveId(
    record?._historyId ??
    record?.attempt_id ??
    record?.attemptId ??
    record?.pauseid ??
    record?.pause_id ??
    record?.id
  );
}

function preserveSavedCounts(source, prepared) {
  const result = {
    ...source,
    ...prepared,
  };

  const fields = [
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
  ];

  if (!isFinishedExamAttempt(source)) {
    for (const field of fields) {
      result[field] = null;
    }

    return result;
  }

  for (const field of fields) {
    const value = source?.[field];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      result[field] = value;
    } else if (
      prepared?.[field] === undefined ||
      prepared?.[field] === null
    ) {
      result[field] = null;
    }
  }

  return result;
}

function normalizeRecord(record, examType) {
  const type = normalizeType(
    record?.exam_type ??
    record?._examType ??
    examType
  );

  const source =
    type === "pqp"
      ? recoverPyqHistory(record)
      : record;

  const prepared =
    prepareExamHistoryResult(source);

  const normalized = preserveSavedCounts(
    source,
    prepared
  );

  const name =
    resolveName(normalized) ||
    resolveName(record);

  return {
    ...normalized,
    exam_type: type,
    _examType: type,
    _historyId: attemptIdOf(record),
    _resolvedExamName: name,
    exam_name: name,
  };
}

async function loadExamType({
  cid,
  examType,
  signal,
}) {
  const response = await fetch(
    "/api/exam-attempt/history",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid,
        exam_type: examType,
      }),
      cache: "no-store",
      signal,
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `${examType}: Invalid history response.`
    );
  }

  if (
    !response.ok ||
    result?.status !== true
  ) {
    throw new Error(
      result?.message ||
      `${examType}: History unavailable.`
    );
  }

  const verified =
    result?.courseFilterVerified === true;

  const partial =
    result?.partialVerification === true;

  if (!verified && !partial) {
    throw new Error(
      `${examType}: Course verification unavailable.`
    );
  }

  const records = normalizeAttemptList({
    response: result,
    examType,
  });

  return {
    records: records.map((record) =>
      normalizeRecord(record, examType)
    ),
    partialVerification: partial,
    unresolvedCount:
      Number(result?.unresolvedCount) || 0,
  };
}

function retryMilliseconds(value) {
  if (!value) {
    return 60000;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds)) {
    return Math.max(
      1000,
      seconds * 1000
    );
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp)
    ? Math.max(
        1000,
        timestamp - Date.now()
      )
    : 60000;
}

async function fetchExamName({
  cid,
  examId,
  examType,
}) {
  const type = normalizeType(examType);

  const key = `${cid}:${type}:${examId}`;

  if (nameCache.has(key)) {
    return nameCache.get(key);
  }

  if (Date.now() < nameCooldownUntil) {
    return "";
  }

  if (nameRequests.has(key)) {
    return nameRequests.get(key);
  }

  const promise = (async () => {
    try {
      const params = new URLSearchParams({
        cid: String(cid),
        examId: String(examId),
        examType: type,
      });

      const response = await fetch(
        `/api/exam-attempt/exam-name?${params}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 429) {
        nameCooldownUntil =
          Date.now() +
          retryMilliseconds(
            response.headers.get(
              "Retry-After"
            )
          );

        return "";
      }

      if (!response.ok) {
        return "";
      }

      const result = await response.json();

      const name = validName(
        result?.examName
      );

      if (name) {
        nameCache.set(key, name);
      }

      return name;
    } catch (error) {
      console.warn(
        "[Exam History] Name lookup failed:",
        type,
        examId,
        error
      );

      return "";
    }
  })();

  nameRequests.set(key, promise);

  try {
    return await promise;
  } finally {
    nameRequests.delete(key);
  }
}

function uniqueAttempts(records) {
  const unique = new Map();

  for (const record of records) {
    const type = normalizeType(
      getAttemptExamType(record)
    );

    const attemptId = attemptIdOf(record);

    const key = attemptId
      ? `${type}:${attemptId}`
      : `${type}:row:${unique.size}`;

    if (!unique.has(key)) {
      unique.set(key, record);
    }
  }

  return sortAttemptsNewestFirst(
    [...unique.values()]
  );
}

export default function ExamHistoryClient({
  cid,
  examTypes = [],
  examName = "",
  governmentExamsSlug = "",
  hasActivePlan = false,
}) {
  const router = useRouter();

  const [attempts, setAttempts] = useState([]);
  const [activeTab, setActiveTab] =
    useState("all");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [historyIncomplete, setHistoryIncomplete] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const attemptedNames = useRef(
    new Set()
  );

  const normalizedTypes = HISTORY_TYPES;

  const refresh = useCallback(() => {
    attemptedNames.current.clear();
    nameCache.clear();

    setRefreshKey((value) => value + 1);
  }, []);

  /* ==========================================
     LOAD EXAM HISTORY
  ========================================== */

  useEffect(() => {
    const controller =
      new AbortController();

    let mounted = true;

    async function load() {
      setLoading(true);
      setHistoryIncomplete(false);

      const results =
        await Promise.allSettled(
          normalizedTypes.map((examType) =>
            loadExamType({
              cid,
              examType,
              signal: controller.signal,
            })
          )
        );

      if (
        !mounted ||
        controller.signal.aborted
      ) {
        return;
      }

      const loaded = [];
      const failures = [];

      let hasPartialVerification = false;

      results.forEach((result, index) => {
        const type = normalizedTypes[index];

        if (result.status === "rejected") {
          failures.push({
            type,
            message:
              result.reason?.message ||
              "History unavailable.",
          });

          return;
        }

        loaded.push(
          ...result.value.records
        );

        if (
          result.value.partialVerification
        ) {
          hasPartialVerification = true;

          console.warn(
            "[Exam History] Partial verification:",
            {
              type,
              unresolvedCount:
                result.value.unresolvedCount,
            }
          );
        }
      });

      if (failures.length) {
        console.warn(
          "[Exam History] Some requests failed:",
          failures
        );
      }

      setAttempts(
        uniqueAttempts(loaded)
      );

      setHistoryIncomplete(
        failures.length > 0 ||
        hasPartialVerification
      );

      setCurrentPage(1);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [cid, refreshKey]);

  /* ==========================================
     EXAM TABS
  ========================================== */

  const tabs = useMemo(() => {
    return buildExamHistoryTabs(
      attempts
    ).filter((tab) => {
      const type = normalizeType(
        tab?.value ??
        tab?.id ??
        tab?.type ??
        tab?.key
      );

      return type !== "studyplan";
    });
  }, [attempts]);

  /* ==========================================
     SEARCH AND FILTER
  ========================================== */

  const filteredAttempts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return attempts.filter((attempt) => {
      const type = normalizeType(
        getAttemptExamType(attempt)
      );

      if (
        activeTab !== "all" &&
        type !== activeTab
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        resolveName(attempt)
          .toLowerCase()
          .includes(query) ||
        type.includes(query) ||
        String(
          examIdOf(attempt) ?? ""
        ).includes(query)
      );
    });
  }, [
    attempts,
    activeTab,
    search,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttempts.length /
      ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const visibleAttempts = useMemo(
    () =>
      filteredAttempts.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      ),
    [
      filteredAttempts,
      startIndex,
    ]
  );

  /* ==========================================
     RESOLVE MISSING EXAM NAMES
  ========================================== */

  useEffect(() => {
    if (
      loading ||
      !visibleAttempts.length
    ) {
      return;
    }

    let cancelled = false;

    async function resolveMissingNames() {
      const missing = new Map();

      for (const attempt of visibleAttempts) {
        if (resolveName(attempt)) {
          continue;
        }

        const examId =
          examIdOf(attempt);

        const examType =
          normalizeType(
            getAttemptExamType(attempt)
          );

        if (!examId || !examType) {
          continue;
        }

        const key =
          `${cid}:${examType}:${examId}`;

        if (
          attemptedNames.current.has(key)
        ) {
          continue;
        }

        attemptedNames.current.add(key);

        missing.set(key, {
          cid,
          examId,
          examType,
        });
      }

      const resolved = new Map();

      for (const [key, item] of missing) {
        if (cancelled) {
          return;
        }

        if (
          Date.now() <
          nameCooldownUntil
        ) {
          break;
        }

        const name =
          await fetchExamName(item);

        if (cancelled) {
          return;
        }

        if (name) {
          resolved.set(key, name);
        }
      }

      if (
        cancelled ||
        !resolved.size
      ) {
        return;
      }

      setAttempts((previous) =>
        previous.map((attempt) => {
          const type = normalizeType(
            getAttemptExamType(attempt)
          );

          const key =
            `${cid}:${type}:${examIdOf(attempt)}`;

          const name = resolved.get(key);

          return name
            ? {
                ...attempt,
                exam_name: name,
                _resolvedExamName: name,
              }
            : attempt;
        })
      );
    }

    resolveMissingNames();

    return () => {
      cancelled = true;
    };
  }, [
    cid,
    loading,
    visibleAttempts,
    refreshKey,
  ]);

  /* ==========================================
     VIEW EXAM ANALYSIS
  ========================================== */

  function handleViewAnalysis(attempt) {
    const attemptId =
      attemptIdOf(attempt);

    const examType = normalizeType(
      getAttemptExamType(attempt)
    );

    if (
      !attemptId ||
      !examType ||
      !governmentExamsSlug
    ) {
      console.warn(
        "[Exam History] Invalid analysis navigation:",
        {
          attemptId,
          examType,
        }
      );

      return;
    }

    const params = new URLSearchParams({
      attemptId: String(attemptId),
      examType,
      title: resolveName(attempt),
    });

    router.push(
      `/dashboard/${encodeURIComponent(
        governmentExamsSlug
      )}/exam-analysis?${params.toString()}`
    );
  }

  /* ==========================================
     EMPTY STATE
  ========================================== */

  const emptyMessage =
    attempts.length === 0
      ? historyIncomplete
        ? "Exam history is temporarily unavailable. Please refresh to try again."
        : "No exams attempted so far."
      : "No exams match your search or filter.";

  /* ==========================================
     UI
  ========================================== */

  return (
    <div className="w-full min-w-0 space-y-5">
      <ExamHistoryHeader
        examName={examName}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        loading={loading}
        onRefresh={refresh}
      />

      {/* No student-facing API warning banners */}

      <div className="min-w-0 max-w-full overflow-x-auto">
        <ExamHistoryTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(value) => {
            const nextType =
              normalizeType(value);

            if (
              nextType === "studyplan"
            ) {
              return;
            }

            setActiveTab(nextType);
            setCurrentPage(1);
          }}
        />
      </div>

      <section
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-[24px]
          border
          border-[#d8e5f4]
          bg-white
          shadow-[0_15px_40px_rgba(15,23,42,0.05)]
        "
      >
        <AttemptedExamTable
          attempts={visibleAttempts}
          loading={loading}
          startIndex={startIndex}
          onViewAnalysis={
            handleViewAnalysis
          }
          emptyMessage={emptyMessage}
        />

        {!loading &&
          filteredAttempts.length > 0 && (
            <ExamHistoryPagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={
                filteredAttempts.length
              }
              startIndex={startIndex}
              itemsPerPage={
                ITEMS_PER_PAGE
              }
              onPageChange={(page) => {
                if (
                  page >= 1 &&
                  page <= totalPages
                ) {
                  setCurrentPage(page);
                }
              }}
            />
          )}
      </section>
    </div>
  );
}
