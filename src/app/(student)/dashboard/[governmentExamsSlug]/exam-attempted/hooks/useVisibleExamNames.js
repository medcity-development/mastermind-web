
"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  nameKey,
  positiveId,
} from "../utils/examHistoryCore";

import {
  cooldownSeconds,
  isNameLookupNeeded,
  loadExamName,
} from "../services/examHistoryService";

const MAX_CONCURRENT_NAMES = 2;

export default function useVisibleExamNames({
  cid,
  attempts = [],
  onNameResolved,
}) {
  const safeCid = positiveId(cid);

  const callbackRef = useRef(onNameResolved);
  const attemptsRef = useRef(attempts);

  useEffect(() => {
    callbackRef.current = onNameResolved;
  }, [onNameResolved]);

  attemptsRef.current = attempts;

  const missingKeys = useMemo(() => {
    if (!safeCid) return "";

    const keys = new Set();

    for (const row of attempts) {
      if (!isNameLookupNeeded(safeCid, row)) {
        continue;
      }

      const key = nameKey(safeCid, row);

      if (key) keys.add(key);
    }

    return [...keys].join("|");
  }, [attempts, safeCid]);

  useEffect(() => {
    if (
      !safeCid ||
      !missingKeys ||
      cooldownSeconds() > 0
    ) {
      return;
    }

    let cancelled = false;
    let stopped = false;

    const wanted = new Set(
      missingKeys.split("|")
    );

    const unique = new Map();

    for (const row of attemptsRef.current) {
      const key = nameKey(safeCid, row);

      if (
        key &&
        wanted.has(key) &&
        !unique.has(key) &&
        isNameLookupNeeded(safeCid, row)
      ) {
        unique.set(key, row);
      }
    }

    const entries = [...unique.entries()];
    let index = 0;

    async function worker() {
      while (!cancelled && !stopped) {
        if (cooldownSeconds() > 0) {
          stopped = true;
          return;
        }

        const entry = entries[index++];

        if (!entry) return;

        const [key, row] = entry;

        try {
          const name = await loadExamName(
            safeCid,
            row
          );

          if (
            !cancelled &&
            name &&
            callbackRef.current
          ) {
            callbackRef.current(key, name);
          }
        } catch (error) {
          if (
            error?.rateLimited ||
            cooldownSeconds() > 0
          ) {
            stopped = true;
            return;
          }

          console.warn(
            "[Exam History] Name lookup failed:",
            key,
            error?.message
          );
        }
      }
    }

    Promise.all(
      Array.from(
        {
          length: Math.min(
            MAX_CONCURRENT_NAMES,
            entries.length
          ),
        },
        () => worker()
      )
    ).catch((error) => {
      if (!cancelled) {
        console.error(
          "[Exam History] Name workers failed:",
          error
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [safeCid, missingKeys]);
}
