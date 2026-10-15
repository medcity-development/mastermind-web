import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/lib/pausedExamAttempts.js", import.meta.url),
  "utf8"
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { getPausedAttemptIds } = await import(moduleUrl);

test("maps only the latest paused attempt for each exam", () => {
  const pausedIds = getPausedAttemptIds({
    details: [
      {
        id: "old-pause",
        exam_id: "mock-1",
        exam_status: "pause",
        updated_at: "2025-01-01T10:00:00Z",
      },
      {
        id: "completed",
        exam_id: "mock-1",
        exam_status: "finish",
        updated_at: "2025-01-01T11:00:00Z",
      },
      {
        id: "latest-pause",
        exam_id: "mock-2",
        exam_status: "paused",
        updated_at: "2025-01-01T12:00:00Z",
      },
      {
        id: "older-pause",
        exam_id: "mock-2",
        exam_status: "pause",
        updated_at: "2025-01-01T09:00:00Z",
      },
    ],
  });

  assert.deepEqual(pausedIds, {
    "mock-2": "latest-pause",
  });
});

test("supports nested attempt responses and attempt ID aliases", () => {
  assert.deepEqual(
    getPausedAttemptIds({
      data: {
        result: [
          {
            attempt_id: 42,
            examId: 7,
            status: "pause",
          },
        ],
      },
    }),
    {
      "7": "42",
    }
  );
});
