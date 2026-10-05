import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";

/* =========================================================
   LOAD examAttemptData.js
========================================================= */

const dataSource =
  await readFile(
    new URL(
      "../src/lib/examAttemptData.js",
      import.meta.url
    ),
    "utf8"
  );

const dataUrl =
  `data:text/javascript;base64,${Buffer.from(
    dataSource
  ).toString("base64")}`;

const {
  buildAttemptPayload,
  getAttemptId,
  getResultArray,
  isFailedResponse,
  parseAnswers,
} = await import(
  dataUrl
);

/* =========================================================
   ATTEMPT PAYLOAD
========================================================= */

test(
  "first submission includes counts, weighted score, session identity and finish status",
  () => {
    const payload =
      buildAttemptPayload(
        {
          /*
           * This uid must NOT be trusted.
           * Session uid must win.
           */
          uid:
            "untrusted",

          cid:
            1,

          exam_id:
            20,

          exam_type:
            "pqp",

          /*
           * Legacy frontend value.
           *
           * buildAttemptPayload must normalize
           * this to "finish".
           */
          exam_status:
            "completed",

          total_questions:
            4,

          total_mark:
            8,

          minus_mark:
            0.5,

          answer_array:
            "[A, B, C, D]",

          user_answers:
            '["a","D",0,"D"]',

          paused_time:
            45,
        },

        "session-user"
      );

    assert.equal(
      payload.uid,
      "session-user"
    );

    assert.equal(
      payload.exam_status,
      "finish"
    );

    assert.equal(
      payload.total_attempted,
      3
    );

    assert.equal(
      payload.total_correct,
      2
    );

    assert.equal(
      payload.total_wrong,
      1
    );

    /*
     * 4 questions
     * total mark = 8
     *
     * mark/question = 2
     *
     * 2 correct = 4
     * 1 wrong * .5 = .5
     *
     * score = 3.5
     */

    assert.equal(
      payload.user_score,
      3.5
    );

    assert.equal(
      payload.paused_time,
      45
    );
  }
);

/* =========================================================
   FINISH NORMALIZATION
========================================================= */

test(
  "all completion aliases normalize to finish",
  () => {
    const statuses = [
      "finish",
      "finished",
      "complete",
      "completed",
    ];

    for (
      const status of statuses
    ) {
      const payload =
        buildAttemptPayload(
          {
            cid:
              1,

            exam_id:
              20,

            exam_type:
              "mock",

            exam_status:
              status,

            total_questions:
              1,

            total_mark:
              1,

            answer_array: [
              "A",
            ],

            user_answers: [
              "A",
            ],
          },

          "37515"
        );

      assert.equal(
        payload.exam_status,
        "finish"
      );
    }
  }
);

/* =========================================================
   PAUSE
========================================================= */

test(
  "paused updates retain their id and unanswered questions are ignored",
  () => {
    const payload =
      buildAttemptPayload(
        {
          pauseid:
            42,

          exam_status:
            "pause",

          total_questions:
            3,

          answer_array: [
            0,
            "B",
            "C",
          ],

          user_answers: [
            0,
            "",
            "C",
          ],
        },

        "1"
      );

    assert.equal(
      payload.pauseid,
      42
    );

    assert.equal(
      payload.exam_status,
      "pause"
    );

    assert.equal(
      payload.total_correct,
      1
    );

    assert.equal(
      payload.total_attempted,
      1
    );

    assert.equal(
      payload.total_wrong,
      0
    );

    assert.equal(
      payload.user_score,
      1
    );
  }
);

/* =========================================================
   RESULT ARRAY
========================================================= */

test(
  "analytics handles empty details, data arrays and nested response shapes",
  () => {
    assert.deepEqual(
      getResultArray({
        details: [],

        data: [
          {
            id: 12,
          },
        ],
      }),

      [
        {
          id: 12,
        },
      ]
    );

    assert.deepEqual(
      getResultArray({
        data: {
          details: [
            {
              id: 13,
            },
          ],
        },
      }),

      [
        {
          id: 13,
        },
      ]
    );

    assert.deepEqual(
      getResultArray({
        details: {
          id:
            14,

          total_correct:
            2,
        },
      }),

      [
        {
          id:
            14,

          total_correct:
            2,
        },
      ]
    );

    assert.equal(
      getAttemptId({
        data: [
          {
            pause_id:
              15,
          },
        ],
      }),

      15
    );

    assert.equal(
      getAttemptId({
        details: {
          insert_id:
            16,
        },
      }),

      16
    );
  }
);

/* =========================================================
   ANSWER PARSING
========================================================= */

test(
  "legacy answer strings are parsed",
  () => {
    assert.deepEqual(
      parseAnswers(
        "[A, B, 0]"
      ),

      [
        "A",
        "B",
        "0",
      ]
    );

    assert.deepEqual(
      parseAnswers(
        '["A","B","C"]'
      ),

      [
        "A",
        "B",
        "C",
      ]
    );

    assert.deepEqual(
      parseAnswers(""),
      []
    );

    assert.deepEqual(
      parseAnswers(null),
      []
    );
  }
);

/* =========================================================
   BACKEND FAILURE FLAGS
========================================================= */

test(
  "backend failure statuses are recognised",
  () => {
    const failedStatuses = [
      false,
      0,
      "0",
      "false",
      "error",
      "failed",
    ];

    for (
      const status of
        failedStatuses
    ) {
      assert.equal(
        isFailedResponse({
          status,
        }),

        true
      );
    }

    assert.equal(
      isFailedResponse({
        status:
          "true",
      }),

      false
    );

    assert.equal(
      isFailedResponse({
        status:
          true,
      }),

      false
    );
  }
);

/* =========================================================
   CREATE + UPDATE API
========================================================= */

test(
  "upstream create/update serialize complete exam statistics and saved attempt ids",
  async () => {
    const originalFetch =
      globalThis.fetch;

    const oldBase =
      process.env
        .PSC_API_BASE_URL;

    const oldKey =
      process.env
        .PSC_API_KEY;

    /*
     * IMPORTANT:
     *
     * Environment variables must be set
     * BEFORE importing examAttemptHelper.js.
     */

    process.env
      .PSC_API_BASE_URL =
      "https://exam.invalid/";

    process.env
      .PSC_API_KEY =
      "test-key";

    try {
      /* =====================================================
         LOAD HELPER AFTER ENV
      ===================================================== */

      let helperSource =
        await readFile(
          new URL(
            "../src/lib/examAttemptHelper.js",
            import.meta.url
          ),
          "utf8"
        );

      /*
       * Only needed if examAttemptHelper imports
       * examAttemptData using this relative path.
       */

      helperSource =
        helperSource.replace(
          '"./examAttemptData"',
          JSON.stringify(
            dataUrl
          )
        );

      helperSource =
        helperSource.replace(
          '"./examAttemptData.js"',
          JSON.stringify(
            dataUrl
          )
        );

      const helperUrl =
        `data:text/javascript;base64,${Buffer.from(
          helperSource
        ).toString(
          "base64"
        )}`;

      const helper =
        await import(
          helperUrl
        );

      const requests = [];

      /* =====================================================
         MOCK SUCCESS RESPONSE
      ===================================================== */

      globalThis.fetch =
        async (
          url,
          options
        ) => {
          const fields =
            Object.fromEntries(
              options.body
            );

          requests.push({
            url:
              String(url),

            fields,
          });

          return Response.json({
            status:
              true,

            pauseid:
              "99",
          });
        };

      /* =====================================================
         BUILD PAYLOAD
      ===================================================== */

      const payload =
        buildAttemptPayload(
          {
            cid:
              1,

            exam_id:
              20,

            exam_type:
              "scert",

            /*
             * Legacy value should become finish.
             */
            exam_status:
              "complete",

            total_questions:
              2,

            total_mark:
              2,

            minus_mark:
              0,

            answer_array: [
              "A",
              "B",
            ],

            user_answers: [
              "A",
              "C",
            ],
          },

          "1"
        );

      assert.equal(
        payload.exam_status,
        "finish"
      );

      assert.equal(
        payload.total_attempted,
        2
      );

      assert.equal(
        payload.total_correct,
        1
      );

      assert.equal(
        payload.total_wrong,
        1
      );

      /* =====================================================
         CREATE
      ===================================================== */

      const created =
        await helper
          .createUserExamAttempt(
            payload
          );

      const createdId =
        getAttemptId(
          created
        );

      assert.equal(
        String(
          createdId
        ),
        "99"
      );

      /* =====================================================
         UPDATE
      ===================================================== */

      await helper
        .updateUserExamAttempt({
          ...payload,

          pauseid:
            createdId,
        });

      /* =====================================================
         CREATE REQUEST
      ===================================================== */

      assert.equal(
        requests[0].url,
        "https://exam.invalid/setNewUserExams"
      );

      assert.equal(
        requests[0]
          .fields
          .exam_status,
        "finish"
      );

      assert.equal(
        requests[0]
          .fields
          .total_correct,
        "1"
      );

      assert.equal(
        requests[0]
          .fields
          .total_wrong,
        "1"
      );

      assert.equal(
        requests[0]
          .fields
          .total_attempted,
        "2"
      );

      assert.equal(
        requests[0]
          .fields
          .user_score,
        "1"
      );

      assert.equal(
        requests[0]
          .fields
          .user_answers,
        '["A","C"]'
      );

      /* =====================================================
         UPDATE REQUEST
      ===================================================== */

      assert.equal(
        requests[1].url,
        "https://exam.invalid/setUpdateUserExams"
      );

      assert.equal(
        requests[1]
          .fields
          .pauseid,
        "99"
      );

      assert.equal(
        requests[1]
          .fields
          .exam_status,
        "finish"
      );

      /* =====================================================
         BACKEND STATUS FALSE
      ===================================================== */

      globalThis.fetch =
        async () =>
          Response.json({
            status:
              false,

            message:
              "Save rejected",
          });

      const rejected =
        await helper
          .createUserExamAttempt(
            payload
          );

      assert.equal(
        rejected.status,
        false
      );
    } finally {
      globalThis.fetch =
        originalFetch;

      if (
        oldBase ===
        undefined
      ) {
        delete process.env
          .PSC_API_BASE_URL;
      } else {
        process.env
          .PSC_API_BASE_URL =
          oldBase;
      }

      if (
        oldKey ===
        undefined
      ) {
        delete process.env
          .PSC_API_KEY;
      } else {
        process.env
          .PSC_API_KEY =
          oldKey;
      }
    }
  }
);

/* =========================================================
   ANALYTIC DETAILS API
========================================================= */

test(
  "getExamAnalyticDetails sends uid cid id and exam_type",
  async () => {
    const originalFetch =
      globalThis.fetch;

    const oldBase =
      process.env
        .PSC_API_BASE_URL;

    const oldKey =
      process.env
        .PSC_API_KEY;

    process.env
      .PSC_API_BASE_URL =
      "https://exam.invalid/";

    process.env
      .PSC_API_KEY =
      "test-key";

    try {
      let helperSource =
        await readFile(
          new URL(
            "../src/lib/examAttemptHelper.js",
            import.meta.url
          ),
          "utf8"
        );

      helperSource =
        helperSource.replace(
          '"./examAttemptData"',
          JSON.stringify(
            dataUrl
          )
        );

      helperSource =
        helperSource.replace(
          '"./examAttemptData.js"',
          JSON.stringify(
            dataUrl
          )
        );

      /*
       * Add a harmless query fragment so Node
       * evaluates a fresh module instance.
       */

      const helperUrl =
        `data:text/javascript;base64,${Buffer.from(
          helperSource
        ).toString(
          "base64"
        )}#analytics`;

      const helper =
        await import(
          helperUrl
        );

      let captured =
        null;

      globalThis.fetch =
        async (
          url,
          options
        ) => {
          captured = {
            url:
              String(url),

            fields:
              Object.fromEntries(
                options.body
              ),
          };

          return Response.json({
            status:
              true,

            details: [
              {
                id:
                  "14497",

                uid:
                  "37515",

                exam_status:
                  "finish",

                exam_id:
                  "87",

                exam_type:
                  "mock",

                total_questions:
                  "100",

                total_mark:
                  "100",

                user_score:
                  "0",
              },
            ],
          });
        };

      const response =
        await helper
          .getExamAnalyticDetails({
            uid:
              37515,

            cid:
              1,

            id:
              14497,

            exam_type:
              "mock",
          });

      assert.equal(
        captured.url,
        "https://exam.invalid/getExamAnalyticDetails"
      );

      assert.equal(
        captured.fields.uid,
        "37515"
      );

      assert.equal(
        captured.fields.cid,
        "1"
      );

      assert.equal(
        captured.fields.id,
        "14497"
      );

      assert.equal(
        captured.fields
          .exam_type,
        "mock"
      );

      assert.equal(
        response.status,
        true
      );

      assert.equal(
        response.details[0]
          .exam_status,
        "finish"
      );
    } finally {
      globalThis.fetch =
        originalFetch;

      if (
        oldBase ===
        undefined
      ) {
        delete process.env
          .PSC_API_BASE_URL;
      } else {
        process.env
          .PSC_API_BASE_URL =
          oldBase;
      }

      if (
        oldKey ===
        undefined
      ) {
        delete process.env
          .PSC_API_KEY;
      } else {
        process.env
          .PSC_API_KEY =
          oldKey;
      }
    }
  }
);