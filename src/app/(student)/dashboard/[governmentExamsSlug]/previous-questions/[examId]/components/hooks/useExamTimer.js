
"use client";

import { useEffect } from "react";

export default function useExamTimer(ctx) {
  const {
    restoreReady,
    submitted,
    paused,
    saving,
    interactionFrozen,
    totalDurationSeconds,
    attempt,
    lock,
    setRemainingSeconds,
  } = ctx;

  useEffect(() => {
    if (
      !restoreReady ||
      submitted ||
      paused ||
      saving ||
      interactionFrozen ||
      totalDurationSeconds <= 0
    ) {
      return;
    }

    let lastTick = Date.now();

    const timer = window.setInterval(() => {
      if (
        attempt.current.frozen ||
        lock.current
      ) {
        lastTick = Date.now();
        return;
      }

      const now = Date.now();

      const elapsed = Math.floor(
        (now - lastTick) / 1000
      );

      if (elapsed < 1) return;

      lastTick += elapsed * 1000;

      attempt.current.remainingSeconds = Math.max(
        0,
        attempt.current.remainingSeconds - elapsed
      );

      setRemainingSeconds(
        attempt.current.remainingSeconds
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, [
    restoreReady,
    submitted,
    paused,
    saving,
    interactionFrozen,
    totalDurationSeconds,
  ]);
}
