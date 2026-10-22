export function getOptionDisplayText(value, key) {
  if (typeof value !== "string") {
    return value;
  }

  const labelPattern = new RegExp(
    `^\\s*(?:\\(${key}\\)|${key}[.)])(?:\\s+|$)`,
    "i"
  );

  return value.replace(labelPattern, "").trim();
}
