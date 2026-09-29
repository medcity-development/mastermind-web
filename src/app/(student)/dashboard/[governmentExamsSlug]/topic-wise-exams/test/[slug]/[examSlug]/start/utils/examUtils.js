export const QUESTIONS_PER_PAGE = 10;

/* =========================================================
   CLEAN BACKEND TEXT
========================================================= */

export function cleanText(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

/* =========================================================
   MINUTES → SECONDS
========================================================= */

export function getInitialTime(totalMinutes) {
  const minutes = Number(totalMinutes);

  if (
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    return 0;
  }

  return Math.floor(minutes * 60);
}

/* =========================================================
   FORMAT TIMER
========================================================= */

export function formatTime(totalSeconds) {
  const secondsValue =
    Math.max(
      0,
      Number(totalSeconds) || 0
    );

  const hours =
    Math.floor(
      secondsValue / 3600
    );

  const minutes =
    Math.floor(
      (secondsValue % 3600) / 60
    );

  const seconds =
    secondsValue % 60;

  if (hours > 0) {
    return [
      hours,
      minutes,
      seconds,
    ]
      .map((value) =>
        String(value).padStart(
          2,
          "0"
        )
      )
      .join(":");
  }

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}