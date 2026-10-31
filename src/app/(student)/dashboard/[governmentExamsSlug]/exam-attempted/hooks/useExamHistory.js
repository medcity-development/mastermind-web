
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  HISTORY_TYPES,
  normalizeType,
  positiveId,
  uniqueAttempts,
  nameKey,
  resolveName,
} from "../utils/examHistoryCore";

import {
  applyCachedNames,
  cooldownSeconds,
  getCachedHistory,
  loadHistoryType,
} from "../services/examHistoryService";

const MAX_WORKERS = 2;

export default function useExamHistory({
  cid,
  examTypes = [],
}) {
  const safeCid = positiveId(cid);

  const typesKey = Array.isArray(examTypes)
    ? [...new Set(
        examTypes
          .map(normalizeType)
          .filter((type) =>
            HISTORY_TYPES.includes(type)
          )
      )].join("|")
    : "";

  const types = useMemo(
    () =>
      typesKey
        ? typesKey.split("|")
        : [...HISTORY_TYPES],
    [typesKey]
  );

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyIncomplete, setHistoryIncomplete] =
    useState(false);
  const [rateLimited, setRateLimited] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const runRef = useRef(0);
  const loadingRef = useRef(false);
  const scopeRef = useRef("");

  const refresh = useCallback(() => {
    if (loadingRef.current) return;

    if (cooldownSeconds() > 0) {
      setRateLimited(true);
      setHistoryIncomplete(true);
      return;
    }

    setRefreshKey((value) => value + 1);
  }, []);

  const updateName = useCallback(
    (key, name) => {
      if (!name || !safeCid) return;

      setAttempts((previous) => {
        let changed = false;

        const next = previous.map((row) => {
          if (nameKey(safeCid, row) !== key) {
            return row;
          }

          if (resolveName(row) === name) {
            return row;
          }

          changed = true;

          return {
            ...row,
            exam_name: name,
            _resolvedExamName: name,
          };
        });

        return changed ? next : previous;
      });
    },
    [safeCid]
  );

  useEffect(() => {
    const scope = `${safeCid ?? "none"}:${typesKey}`;

    if (scopeRef.current !== scope) {
      scopeRef.current = scope;
      setAttempts([]);
    }

    const runId = ++runRef.current;
    let cancelled = false;

    const isCurrent = () =>
      !cancelled && runRef.current === runId;

    if (!safeCid) {
      loadingRef.current = false;
      setAttempts([]);
      setLoading(false);
      setHistoryIncomplete(true);
      setLoadedCount(0);

      return () => {
        cancelled = true;
      };
    }

    const loaded = new Map();

    for (const type of types) {
      const cached = getCachedHistory(safeCid, type);

      if (cached) {
        loaded.set(type, cached.records);
      }
    }

    function publish() {
      if (!isCurrent()) return;

      const merged = uniqueAttempts(
        [...loaded.values()].flat()
      );

      const named = applyCachedNames(
        safeCid,
        merged
      );

      setAttempts(named);
    }

    async function run() {
      const force = refreshKey > 0;

      let incomplete = false;
      let limited = false;

      const queue = [];

      for (const type of types) {
        const cached = getCachedHistory(
          safeCid,
          type
        );

        if (cached?.partialVerification) {
          incomplete = true;
        }

        if (
          force ||
          !cached ||
          cached.expiresAt <= Date.now()
        ) {
          queue.push(type);
        }
      }

      publish();

      setLoadedCount(
        types.length - queue.length
      );

      setHistoryIncomplete(incomplete);
      setRateLimited(false);

      const needsLoading = queue.length > 0;

      loadingRef.current = needsLoading;
      setLoading(needsLoading);

      if (!needsLoading) return;

      let index = 0;
      let completed = 0;
      let stopped = false;

      async function worker() {
        while (isCurrent() && !stopped) {
          if (cooldownSeconds() > 0) {
            incomplete = true;
            limited = true;
            stopped = true;
            return;
          }

          const position = index++;

          if (position >= queue.length) {
            return;
          }

          const type = queue[position];

          try {
            const result = await loadHistoryType({
              cid: safeCid,
              examType: type,
              force,
            });

            if (!isCurrent()) return;

            loaded.set(type, result.records);

            if (result.partialVerification) {
              incomplete = true;
            }

            publish();
          } catch (error) {
            if (!isCurrent()) return;

            incomplete = true;

            if (
              error?.rateLimited ||
              cooldownSeconds() > 0
            ) {
              limited = true;
              stopped = true;
            } else {
              console.warn(
                "[Exam History] Failed:",
                type,
                error?.message
              );
            }
          } finally {
            completed++;

            if (isCurrent()) {
              setLoadedCount(
                types.length -
                  queue.length +
                  completed
              );
            }
          }
        }
      }

      await Promise.all(
        Array.from(
          {
            length: Math.min(
              MAX_WORKERS,
              queue.length
            ),
          },
          () => worker()
        )
      );

      if (!isCurrent()) return;

      loadingRef.current = false;

      setHistoryIncomplete(incomplete);
      setRateLimited(limited);
      setLoading(false);
    }

    run().catch((error) => {
      if (!isCurrent()) return;

      loadingRef.current = false;

      console.error(
        "[Exam History] Loading error:",
        error
      );

      setHistoryIncomplete(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [safeCid, types, typesKey, refreshKey]);

  return {
    attempts,
    loading,
    historyIncomplete,
    rateLimited,
    loadedCount,
    totalTypes: types.length,
    types,
    refresh,
    updateName,
  };
}
