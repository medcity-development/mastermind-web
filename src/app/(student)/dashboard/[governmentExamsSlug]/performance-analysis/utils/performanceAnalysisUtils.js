import {
    getAttemptId,
    getResultArray,
} from "@/lib/examAttemptData";
import { isFinishedExamAttempt, isPausedExamAttempt } from "@/lib/examAttemptStatus";

// Share overlapping loads (including development Strict Mode's effect replay).
const pendingTypeLoads = new Map();
const pendingDetails = new Map();
const completedDetails = new Map();
const DETAILS_TTL = 60_000;
const MAX_CACHED_DETAILS = 200;

/* =========================================================
   EXAM TYPES
========================================================= */

export const EXAM_TYPES = [
    {
        label: "Statement Tests",
        examType: "tst",
    },
    {
        label: "Mock Test",
        examType: "mock",
    },
    {
        label: "Previous Questions",
        examType: "pqp",
    },
    {
        label: "SCERT Test",
        examType: "scert",
    },
    {
        label: "Topic Wise",
        examType: "twe",
    },
];

/* =========================================================
   NUMBER
========================================================= */

export function toNumber(
    value,
    fallback = 0
) {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return fallback;
    }

    const parsed =
        Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : fallback;
}

/* =========================================================
   USER EXAMS
========================================================= */

export async function fetchUserExams({
    cid,
    uid,
    examType,
}) {
    try {
        const response =
            await fetch(
                "/api/exam-attempt/user-exams",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            cid,
                            uid,
                            exam_type:
                                examType,
                        }),

                    cache: "no-store",
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            result?.status === false
        ) {
            return {
                status: false,
                data: [],
                details: [],
                message:
                    result?.message ||
                    result?.msg ||
                    "",
            };
        }

        return result;
    } catch (error) {
        console.error(
            `${examType} user exams:`,
            error
        );

        return {
            status: false,
            data: [],
            details: [],
        };
    }
}

/* =========================================================
   ATTEMPT DETAILS
========================================================= */

export async function fetchAttemptDetails({
    cid,
    uid,
    attemptId,
    examType,
}) {
    const key = JSON.stringify([String(uid), String(cid), examType, String(attemptId)]);
    const cached = completedDetails.get(key);
    if (cached?.expiresAt > Date.now()) return cached.data;
    completedDetails.delete(key);

    if (pendingDetails.has(key)) return pendingDetails.get(key);

    const request = requestAttemptDetails({ cid, uid, attemptId, examType });
    pendingDetails.set(key, request);
    try {
        const details = await request;
        // Paused attempts and failures must be fetched again on the next load.
        if (details && isFinishedExamAttempt(details)) {
            completedDetails.set(key, { data: details, expiresAt: Date.now() + DETAILS_TTL });
            while (completedDetails.size > MAX_CACHED_DETAILS) {
                completedDetails.delete(completedDetails.keys().next().value);
            }
        }
        return details;
    } finally {
        pendingDetails.delete(key);
    }
}

async function requestAttemptDetails({
    cid,
    uid,
    attemptId,
    examType,
}) {
    try {
        const response =
            await fetch(
                "/api/exam-attempt/analytics-details",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            cid,
                            uid,

                            id:
                                attemptId,

                            exam_type:
                                examType,
                        }),

                    cache: "no-store",
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            result?.status === false
        ) {
            return null;
        }

        return (
            getResultArray(
                result
            )[0] ?? null
        );
    } catch (error) {
        console.error(
            "Attempt details:",
            error
        );

        return null;
    }
}

/* =========================================================
   NORMALIZE
========================================================= */

export function normalizeAttempt({
    item,
    details,
    examType,
    examLabel,
}) {
    const source = {
        ...item,
        ...details,
    };

    const attemptId =
        source?.id ??
        getAttemptId(item);

    const totalQuestions =
        toNumber(
            source?.total_questions
        );

    const finished = isFinishedExamAttempt(source);
    const attempted = finished
        ? toNumber(source?.total_attempted)
        : null;
    const correct = finished
        ? toNumber(source?.total_correct)
        : null;
    const wrong = finished
        ? toNumber(
            source?.total_wrong,
            Math.max(0, attempted - correct)
        )
        : null;

    const score = finished
        ? toNumber(source?.user_score, correct)
        : null;

    const totalMark =
        toNumber(
            source?.total_mark,
            totalQuestions
        );

    const percentage =
        finished && totalMark > 0
            ? Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        (score /
                            totalMark) *
                        100
                    )
                )
            )
            : 0;

    return {
        attemptId,
        examType,
        examLabel,

        title:
            source?.exam_name ??
            source?.examName ??
            source?.exam ??
            source?.title ??
            `${examLabel} #${attemptId ?? ""}`,

        status:
            source?.exam_status ??
            source?.status ??
            "-",

        totalQuestions,
        totalMark,
        attempted,
        correct,
        wrong,
        score,
        percentage,

        createdAt:
            source?.created_at ??
            "",

        modifiedAt:
            source?.modified_at ??
            source?.updated_at ??
            "",
    };
}

/* =========================================================
   LOAD TYPE
========================================================= */

export async function loadTypeAttempts(options) {
    const key = JSON.stringify([String(options.uid), String(options.cid), options.examType, options.examLabel]);
    if (pendingTypeLoads.has(key)) return pendingTypeLoads.get(key);

    const request = requestTypeAttempts(options);
    pendingTypeLoads.set(key, request);
    try {
        return await request;
    } finally {
        pendingTypeLoads.delete(key);
    }
}

async function requestTypeAttempts({
    cid,
    uid,
    examType,
    examLabel,
}) {
    const result =
        await fetchUserExams({
            cid,
            uid,
            examType,
        });

    if (
        result?.status === false
    ) {
        throw new Error(
            result?.message ||
            `Unable to load ${examLabel} performance.`
        );
    }

    const rows =
        getResultArray(
            result
        ).filter(
            (item) =>
                !item?.exam_type ||
                String(
                    item.exam_type
                )
                    .trim()
                    .toLowerCase() ===
                examType
        );

    if (!rows.length) {
        return [];
    }

    const attempts =
        await Promise.all(
            rows.map(
                async (item) => {
                    const attemptId =
                        getAttemptId(
                            item
                        );

                    let details =
                        null;

                    const hasStats =
                        [
                            "total_attempted",
                            "total_correct",
                            "total_wrong",
                            "user_score",
                        ].every(
                            (key) =>
                                item?.[key] !==
                                null &&
                                item?.[key] !==
                                undefined &&
                                item?.[key] !==
                                ""
                        );

                    if (
                        attemptId &&
                        !isPausedExamAttempt(item) &&
                        !hasStats
                    ) {
                        details =
                            await fetchAttemptDetails({
                                cid,
                                uid,
                                attemptId,
                                examType,
                            });
                    }

                    return normalizeAttempt({
                        item,
                        details,
                        examType,
                        examLabel,
                    });
                }
            )
        );

    return attempts.filter(
        (attempt) =>
            attempt.attemptId !==
            null
    );
}

/* =========================================================
   DATE
========================================================= */

export function getTimestamp(
    attempt
) {
    const value =
        attempt?.modifiedAt ||
        attempt?.createdAt;

    const parsed =
        Date.parse(value);

    return Number.isFinite(
        parsed
    )
        ? parsed
        : 0;
}

/* =========================================================
   STATUS
========================================================= */

export function formatStatus(
    value
) {
    const status =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();

    if (
        status === "pause" ||
        status === "paused"
    ) {
        return "Paused";
    }

    if (
        [
            "finish",
            "finished",
            "complete",
            "completed",
        ].includes(status)
    ) {
        return "Completed";
    }

    return value || "-";
}

/* =========================================================
   SUMMARY
========================================================= */

export function buildPerformanceSummary(
    attempts = []
) {
    const finishedAttempts =
        attempts.filter(isFinishedExamAttempt);

    const totalAttempted =
        finishedAttempts.reduce(
            (
                sum,
                attempt
            ) =>
                sum +
                toNumber(
                    attempt?.attempted
                ),
            0
        );

    const totalCorrect =
        finishedAttempts.reduce(
            (
                sum,
                attempt
            ) =>
                sum +
                toNumber(
                    attempt?.correct
                ),
            0
        );

    const totalWrong =
        finishedAttempts.reduce(
            (
                sum,
                attempt
            ) =>
                sum +
                toNumber(
                    attempt?.wrong
                ),
            0
        );

    const averageScore =
        finishedAttempts.length
            ? Math.round(
                finishedAttempts.reduce(
                    (
                        sum,
                        attempt
                    ) =>
                        sum +
                        toNumber(
                            attempt?.percentage
                        ),
                    0
                ) /
                finishedAttempts.length
            )
            : null;

    return {
        tests:
            attempts.length,

        totalAttempted,
        totalCorrect,
        totalWrong,
        averageScore,
        finishedAttempts: finishedAttempts.length,
    };
}
