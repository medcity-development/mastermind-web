"use client";

import { useCallback, useEffect, useState } from "react";
import { HISTORY_TYPES, nameKey, normalizeRecord, uniqueAttempts } from "../exam-attempted/utils/examHistoryCore";
import { applyCachedNames } from "../exam-attempted/services/examHistoryService";
import { normalizeAttemptList } from "../exam-attempted/utils/examHistoryUtils";

// Read fresh, authenticated API data on entry; never reuse another session's
// client history cache or hide an attempt that was just paused.
export default function usePausedExamHistory({ cid }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyIncomplete, setIncomplete] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const updateName = useCallback((key, name) => {
    setAttempts((rows) => rows.map((row) => nameKey(cid, row) === key
      ? { ...row, exam_name: name, _resolvedExamName: name } : row));
  }, [cid]);

  useEffect(() => {
    const controller = new AbortController();
    let next = 0;
    let stopped = false;
    const rows = [];
    async function worker() {
      while (next < HISTORY_TYPES.length && !controller.signal.aborted && !stopped) {
        const type = HISTORY_TYPES[next++];
        try {
          const response = await fetch("/api/exam-attempt/paused-history", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cid, exam_type: type }), cache: "no-store", signal: controller.signal,
          });
          const data = await response.json();
          if (controller.signal.aborted) return;
          if (response.status === 429 || data.rateLimited) { stopped = true; setRateLimited(true); }
          if (!response.ok || data.status !== true || data.courseFilterVerified !== true) throw new Error("History unavailable");
          if (data.partialVerification) setIncomplete(true);
          rows.push(...normalizeAttemptList({ response: data, examType: type })
            .filter((row) => row?._courseVerified === true)
            .map((row) => normalizeRecord(row, type)));
          setAttempts(applyCachedNames(cid, uniqueAttempts(rows)));
        } catch {
          if (!controller.signal.aborted) setIncomplete(true);
        }
      }
    }
    async function load() {
      setLoading(true);
      setIncomplete(false);
      setRateLimited(false);
      setAttempts([]);
      await Promise.all([worker(), worker()]);
      if (!controller.signal.aborted) setLoading(false);
    }
    void load();
    return () => controller.abort();
  }, [cid, revision]);
  return { attempts, loading, historyIncomplete, rateLimited, refresh, updateName };
}
