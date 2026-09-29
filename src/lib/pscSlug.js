// src/lib/pscSlug.js

/* =========================================================
   CREATE SLUG
========================================================= */

export function createSlug(value = "") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/* =========================================================
   NORMALIZE COURSE SLUG
========================================================= */

export function normalizeCourseSlug(
  value = ""
) {
  return createSlug(
    String(value ?? "").replace(
      /-coaching$/,
      ""
    )
  );
}


/* =========================================================
   FORMAT SLUG
   Backward-compatible alias
========================================================= */

export function formatSlug(
  value = ""
) {
  return createSlug(value);
}