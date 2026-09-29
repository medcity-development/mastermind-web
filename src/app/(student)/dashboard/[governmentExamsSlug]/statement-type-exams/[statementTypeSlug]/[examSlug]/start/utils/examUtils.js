export const QUESTIONS_PER_PAGE =
  10;

export function cleanText(
  value = ""
) {
  return String(value)
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(
      /\r\n/g,
      "\n"
    )
    .trim();
}

export function formatTime(
  totalSeconds
) {
  const value =
    Math.max(
      0,
      Number(
        totalSeconds
      ) || 0
    );

  const hours =
    Math.floor(
      value / 3600
    );

  const minutes =
    Math.floor(
      (value % 3600) /
        60
    );

  const seconds =
    value % 60;

  if (hours > 0) {
    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
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