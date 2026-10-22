import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/lib/examOptionUtils.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { getOptionDisplayText } = await import(moduleUrl);

test("removes a matching option label before rendering its text", () => {
  assert.equal(getOptionDisplayText("A. B", "A"), "B");
  assert.equal(getOptionDisplayText("(B) Choice text", "B"), "Choice text");
  assert.equal(getOptionDisplayText("C) Choice text", "C"), "Choice text");
});

test("preserves non-matching option text", () => {
  assert.equal(getOptionDisplayText("A. B", "B"), "A. B");
  assert.equal(getOptionDisplayText("A. apple", "A"), "apple");
});
