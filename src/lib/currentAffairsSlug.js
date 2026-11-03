export function createCurrentAffairsMonthSlug(month, year) {
  const cleanMonth = String(month ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cleanYear = String(year ?? "").trim();

  return cleanMonth && cleanYear
    ? `${cleanMonth}-${cleanYear}`
    : "";
}
