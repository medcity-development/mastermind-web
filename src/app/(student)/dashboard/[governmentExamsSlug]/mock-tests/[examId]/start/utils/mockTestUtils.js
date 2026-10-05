// src/app/(student)/dashboard/[governmentExamsSlug]
// /mock-tests/[examId]/start/utils/mockTestUtils.js

export const QUESTIONS_PER_PAGE =
    10;

export const WRONG_MARK =
    0.333;

export const CORRECT_MARK =
    1;

/* =========================================================
   NORMALIZE ANSWER
========================================================= */

export function normalizeAnswer(
    value
) {
    const answer =
        String(
            value ?? ""
        )
            .trim()
            .toUpperCase();

    if (
        !answer ||
        answer === "0" ||
        answer === "NULL" ||
        answer === "UNDEFINED"
    ) {
        return "";
    }

    if (
        /^[A-Z]$/.test(
            answer
        )
    ) {
        return answer;
    }

    const match =
        answer.match(
            /^([A-Z])(?:[\s.):\-]|$)/
        );

    return (
        match?.[1] ||
        answer
    );
}

/* =========================================================
   CORRECT ANSWER
========================================================= */

export function getCorrectAnswer(
    question
) {
    return (
        question?.answer ??
        question?.correct_answer ??
        question?.correctAnswer ??
        question?.right_answer ??
        question?.rightAnswer ??
        question?.correct_option ??
        question?.correctOption ??
        question?.ans ??
        ""
    );
}

/* =========================================================
   PARSE SAVED ANSWERS
========================================================= */

export function parseAnswerArray(
    value
) {
    if (
        Array.isArray(value)
    ) {
        return value;
    }

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return [];
    }

    const text =
        String(value).trim();

    if (!text) {
        return [];
    }

    try {
        const parsed =
            JSON.parse(text);

        if (
            Array.isArray(parsed)
        ) {
            return parsed;
        }

        if (
            typeof parsed ===
            "string"
        ) {
            try {
                const second =
                    JSON.parse(
                        parsed
                    );

                if (
                    Array.isArray(
                        second
                    )
                ) {
                    return second;
                }
            } catch {
                // Continue.
            }
        }
    } catch {
        // Legacy parser below.
    }

    return text
        .replace(
            /^\[/,
            ""
        )
        .replace(
            /\]$/,
            ""
        )
        .split(",")
        .map((item) =>
            String(item)
                .trim()
                .replace(
                    /^["']|["']$/g,
                    ""
                )
        );
}

/* =========================================================
   ATTEMPT ID
========================================================= */

export function getAttemptId(
    result
) {
    if (
        !result ||
        typeof result !==
        "object"
    ) {
        return null;
    }

    const keys = [
        "pauseid",
        "pause_id",
        "attempt_id",
        "attemptId",
        "id",
        "last_id",
        "lastid",
        "insert_id",
    ];

    for (
        const key of keys
    ) {
        const value =
            result?.[key];

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() &&
            String(value) !== "0"
        ) {
            return value;
        }
    }

    const nestedSources = [
        result?.data,
        result?.details,
        result?.result,
    ];

    for (
        const source of
        nestedSources
    ) {
        if (!source) {
            continue;
        }

        if (
            Array.isArray(source)
        ) {
            for (
                const item of source
            ) {
                const id =
                    getAttemptId(
                        item
                    );

                if (id) {
                    return id;
                }
            }

            continue;
        }

        if (
            typeof source ===
            "object"
        ) {
            const id =
                getAttemptId(
                    source
                );

            if (id) {
                return id;
            }
        }
    }

    return null;
}

/* =========================================================
   DATABASE RESULT
========================================================= */

export function getDatabaseResult(
    result
) {
    if (
        Array.isArray(
            result?.details
        )
    ) {
        return (
            result.details[0] ??
            null
        );
    }

    if (
        result?.details &&
        typeof result.details ===
        "object"
    ) {
        return result.details;
    }

    if (
        Array.isArray(
            result?.data
        )
    ) {
        return (
            result.data[0] ??
            null
        );
    }

    if (
        result?.data &&
        typeof result.data ===
        "object"
    ) {
        return result.data;
    }

    return null;
}

/* =========================================================
   EXAM TYPE
========================================================= */

export function getExamType(
    ...sources
) {
    for (
        const source of sources
    ) {
        const value =
            source?.exam_type ??
            source?.examType ??
            source?.type ??
            source?.lastposition;

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim()
        ) {
            return String(value)
                .trim()
                .toLowerCase();
        }
    }

    return "";
}

/* =========================================================
   EXAM STATUS
========================================================= */

export function getExamStatus(
    value
) {
    const status =
        String(
            value ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        status === "finish" ||
        status === "finished" ||
        status === "complete" ||
        status === "completed"
    ) {
        return "finish";
    }

    if (
        status === "pause" ||
        status === "paused"
    ) {
        return "pause";
    }

    return status;
}

/* =========================================================
   DURATION
========================================================= */

export function getDurationSeconds(
    exam
) {
    const minutes =
        Number(
            exam?.total_minutes ??
            exam?.totalMinutes ??
            exam?.duration_minutes ??
            exam?.duration
        );

    if (
        !Number.isFinite(
            minutes
        ) ||
        minutes <= 0
    ) {
        return 0;
    }

    return Math.floor(
        minutes * 60
    );
}

/* =========================================================
   TOTAL MARK
========================================================= */

export function getExamTotalMark(
    exam,
    fallback = 0
) {
    const value =
        Number(
            exam?.total_mark ??
            exam?.totalMark
        );

    return Number.isFinite(
        value
    ) &&
        value > 0
        ? value
        : fallback;
}

/* =========================================================
   ROUND 2 DECIMALS
========================================================= */

export function roundMark(
    value
) {
    const number =
        Number(value);

    if (
        !Number.isFinite(
            number
        )
    ) {
        return 0;
    }

    return (
        Math.round(
            number * 100
        ) / 100
    );
}

/* =========================================================
   RESULT CALCULATION

   SAME AS ANDROID:

   Correct = +1
   Wrong   = -0.333
   Skipped = 0
========================================================= */

export function calculateMockResult({
    questions = [],
    answers = {},
} = {}) {
    const questionList =
        Array.isArray(
            questions
        )
            ? questions
            : [];

    const answerArray =
        questionList.map(
            (question) =>
                getCorrectAnswer(
                    question
                ) || 0
        );

    const userAnswers =
        questionList.map(
            (
                question,
                index
            ) => {
                const questionId =
                    question?.id ??
                    index + 1;

                return (
                    answers?.[
                    questionId
                    ] ?? 0
                );
            }
        );

    let totalAttempted =
        0;

    let totalCorrect =
        0;

    userAnswers.forEach(
        (
            answer,
            index
        ) => {
            const selected =
                normalizeAnswer(
                    answer
                );

            /*
             * Unanswered = skipped.
             */
            if (!selected) {
                return;
            }

            totalAttempted +=
                1;

            const correct =
                normalizeAnswer(
                    answerArray[
                    index
                    ]
                );

            if (
                correct &&
                selected ===
                correct
            ) {
                totalCorrect +=
                    1;
            }
        }
    );

    const totalWrong =
        Math.max(
            0,
            totalAttempted -
            totalCorrect
        );

    /*
     * Android:
     *
     * Math.round(
     *   wrong * 0.333 * 100
     * ) / 100
     */
    const minusMark =
        roundMark(
            totalWrong *
            WRONG_MARK
        );

    const positiveMark =
        roundMark(
            totalCorrect *
            CORRECT_MARK
        );

    const userScore =
        roundMark(
            positiveMark -
            minusMark
        );

    const skipped =
        Math.max(
            0,
            questionList.length -
            totalAttempted
        );

    return {
        answerArray,
        userAnswers,

        totalAttempted,
        totalCorrect,
        totalWrong,
        skipped,

        positiveMark,
        minusMark,
        userScore,
    };
}

/* =========================================================
   POST JSON
========================================================= */

export async function postJson(
    endpoint,
    payload
) {
    const response =
        await fetch(
            endpoint,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(
                        payload
                    ),

                cache:
                    "no-store",
            }
        );

    const text =
        await response.text();

    let result;

    try {
        result =
            text
                ? JSON.parse(text)
                : {};
    } catch {
        throw new Error(
            "Exam API returned invalid JSON."
        );
    }

    if (
        !response.ok ||
        result?.status === false
    ) {
        throw new Error(
            result?.message ||
            result?.msg ||
            "Exam service request failed."
        );
    }

    return result;
}