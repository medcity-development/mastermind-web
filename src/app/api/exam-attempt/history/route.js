import {
  NextResponse,
} from "next/server";

import {
  getStudentSession,
} from "@/lib/auth/getStudentSession";

import {
  getUserExamList,
} from "@/lib/examAttemptHelper";

import {
  resolveExamHistoryName,
} from "@/lib/examHistoryHelper";

export const dynamic =
  "force-dynamic";

/* =========================================================
   DETAILS ARRAY
========================================================= */

function getDetails(
  result
) {
  if (
    Array.isArray(
      result?.details
    )
  ) {
    return result.details;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  return [];
}

/* =========================================================
   ATTEMPT EXAM ID
========================================================= */

function getExamId(
  item
) {
  return (
    item?.exam_id ??
    item?.examId ??
    item?.test_id ??
    item?.testId ??
    null
  );
}

/* =========================================================
   ATTEMPT TYPE
========================================================= */

function getExamType(
  item,
  fallback = ""
) {
  return String(
    item?.exam_type ??
    item?.examType ??
    item?.type ??
    item?.lastposition ??
    fallback ??
    ""
  )
    .trim()
    .toLowerCase();
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request
) {
  try {
    /* =====================================================
       SESSION
    ===================================================== */

    const session =
      await getStudentSession();

    const uid =
      Number(
        session?.uid
      );

    if (
      !Number.isFinite(uid) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Please sign in to continue.",

          details: [],
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

    let body = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    const cid =
      Number(
        body?.cid
      );

    const examType =
      String(
        body?.exam_type ??
        body?.examType ??
        ""
      )
        .trim()
        .toLowerCase();

    if (
      !Number.isFinite(cid) ||
      cid <= 0
    ) {
      return NextResponse.json(
        {
          status: false,

          message:
            "Valid cid is required.",

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    if (!examType) {
      return NextResponse.json(
        {
          status: false,

          message:
            "exam_type is required.",

          details: [],
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       USER ATTEMPTS
    ===================================================== */

    const result =
      await getUserExamList({
        uid,

        exam_type:
          examType,
      });

    const details =
      getDetails(
        result
      );

    /*
     * An empty history is valid.
     */
    if (!details.length) {
      return NextResponse.json(
        {
          status: true,

          exam_type:
            examType,

          details: [],
        },
        {
          status: 200,
        }
      );
    }

    /* =====================================================
       UNIQUE EXAM NAMES

       Important:
       Many attempts can point to the same exam_id.

       Resolve each exam ID only once.
    ===================================================== */

    const uniqueExams =
      new Map();

    details.forEach(
      (item) => {
        const itemExamId =
          getExamId(
            item
          );

        const itemExamType =
          getExamType(
            item,
            examType
          );

        if (!itemExamId) {
          return;
        }

        const key =
          `${itemExamType}-${itemExamId}`;

        if (
          !uniqueExams.has(
            key
          )
        ) {
          uniqueExams.set(
            key,
            {
              examId:
                itemExamId,

              examType:
                itemExamType,

              item,
            }
          );
        }
      }
    );

    /* =====================================================
       RESOLVE NAMES IN PARALLEL
    ===================================================== */

    const resolvedEntries =
      await Promise.all(
        Array.from(
          uniqueExams.entries()
        ).map(
          async ([
            key,
            value,
          ]) => {
            const name =
              await resolveExamHistoryName({
                cid,
                uid,

                examId:
                  value.examId,

                examType:
                  value.examType,

                item:
                  value.item,
              });

            return [
              key,
              name,
            ];
          }
        )
      );

    const nameMap =
      new Map(
        resolvedEntries
      );

    /* =====================================================
       ENRICH HISTORY RECORDS
    ===================================================== */

    const enrichedDetails =
      details.map(
        (item) => {
          const itemExamId =
            getExamId(
              item
            );

          const itemExamType =
            getExamType(
              item,
              examType
            );

          const key =
            `${itemExamType}-${itemExamId}`;

          const resolvedName =
            nameMap.get(
              key
            ) || "";

          return {
            ...item,

            /*
             * Keep original backend fields.
             */

            exam_type:
              itemExamType,

            /*
             * Add resolved display name.
             *
             * Your table can read either of these.
             */
            exam_name:
              resolvedName,

            _resolvedExamName:
              resolvedName,
          };
        }
      );

    console.log(
      "EXAM HISTORY ENRICHED:",
      enrichedDetails.slice(
        0,
        3
      )
    );

    return NextResponse.json(
      {
        ...result,

        status: true,

        exam_type:
          examType,

        details:
          enrichedDetails,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "EXAM HISTORY ROUTE:",
      error
    );

    return NextResponse.json(
      {
        status: false,

        message:
          error?.message ||
          "Unable to load exam history.",

        details: [],
      },
      {
        status: 500,
      }
    );
  }
}