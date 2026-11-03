import test from "node:test";
import assert from "node:assert/strict";

import { loadServerModule } from "./helpers/load-server-module.mjs";

const { createCurrentAffairsMonthSlug } = await loadServerModule(
  "currentAffairsSlug"
);

test("creates a normalized month-and-year current affairs slug", () => {
  assert.equal(
    createCurrentAffairsMonthSlug(" November ", 2026),
    "november-2026"
  );
  assert.equal(
    createCurrentAffairsMonthSlug("Jan / Feb", "2026"),
    "jan-feb-2026"
  );
});

test("returns an empty slug when month or year is missing", () => {
  assert.equal(createCurrentAffairsMonthSlug("", 2026), "");
  assert.equal(createCurrentAffairsMonthSlug("November", null), "");
});
