
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
import { getHistoryLoadStatus } from "../utils/historyLoadStatus";

const MAX_WORKERS = 2;

export default function useExamHistory({
  cid,
  uid,
  examTypes = [],
  scope = "course",
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
  const [loadStatus, setLoadStatus] = useState(() =>
    getHistoryLoadStatus(new Map())
  );
  const [rateLimited, setRateLimited] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const runRef = useRef(0);
  const loadingRef = useRef(false);

  const refresh = useCallback(() => {
    if (loadingRef.current) return;

    if (cooldownSeconds() > 0) {
      setRateLimited(true);
      setLoadStatus((previous) => ({ ...previous, historyIncomplete: true }));
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
    const runId = ++runRef.current;
    let cancelled = false;

    const isCurrent = () =>
      !cancelled && runRef.current === runId;

    const loaded = new Map();

    for (const type of types) {
      const cached = getCachedHistory(safeCid, type, scope, uid);

      if (cached) {
        loaded.set(type, cached);
      }
    }

    function publish() {
      if (!isCurrent()) return;

      const merged = uniqueAttempts(
        [...loaded.values()].flatMap((result) => result.records)
      );

      const named = applyCachedNames(
        safeCid,
        merged
      );

      setAttempts(named);
    }

    async function run() {
      if (!isCurrent()) return;
      if (!safeCid) {
        loadingRef.current = false;
        setAttempts([]);
        setLoading(false);
        setLoadStatus(getHistoryLoadStatus(new Map(), types));
        setLoadedCount(0);
        return;
      }

      const force = refreshKey > 0;

      const failedTypes = new Set();
      let limited = false;

      const queue = [];

      for (const type of types) {
        const cached = getCachedHistory(
          safeCid,
          type,
          scope,
          uid
        );

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

      setLoadStatus(getHistoryLoadStatus(loaded));
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
            for (const type of queue.slice(index)) failedTypes.add(type);
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
              scope,
              uid,
            });

            if (!isCurrent()) return;

            loaded.set(type, result);

            publish();
          } catch (error) {
            if (!isCurrent()) return;

            failedTypes.add(type);

            if (
              error?.rateLimited ||
              cooldownSeconds() > 0
            ) {
              limited = true;
              stopped = true;
              for (const pendingType of queue.slice(index)) failedTypes.add(pendingType);
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

      setLoadStatus(getHistoryLoadStatus(loaded, [...failedTypes]));
      setRateLimited(limited);
      setLoading(false);
    }

    // Start after effect setup so a discarded Strict Mode run cannot publish.
    Promise.resolve().then(run).catch((error) => {
      if (!isCurrent()) return;

      loadingRef.current = false;

      console.error(
        "[Exam History] Loading error:",
        error
      );

      setLoadStatus(getHistoryLoadStatus(loaded, types));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [safeCid, types, typesKey, refreshKey, scope, uid]);

  return {
    attempts,
    loading,
    ...loadStatus,
    rateLimited,
    loadedCount,
    totalTypes: types.length,
    types,
    refresh,
    updateName,
  };
}
