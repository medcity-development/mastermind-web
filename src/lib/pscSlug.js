export function createSlug(value = "") {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  export function normalizeCourseSlug(
    value = ""
  ) {
    return createSlug(
      String(value).replace(
        /-coaching$/,
        ""
      )
    );
  }