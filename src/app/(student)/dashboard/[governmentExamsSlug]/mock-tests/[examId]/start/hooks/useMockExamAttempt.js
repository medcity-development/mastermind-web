
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    calculateMockResult,
    getAttemptId,
    getDatabaseResult,
    getExamTotalMark,
    postJson,
} from "../utils/mockTestUtils";

import {
    buildMockAttemptPayload,
    getMockExamTitle,
} from "../utils/mockAttemptUtils";

import {
    clearGuestExamHandoff,
} from "@/lib/guestExamHandoff";

export default function useMockExamAttempt({
    uid,
    cid,
    examId,
    examType = "mock",
    exam,
    questions = [],
    answersRef,
    remainingSeconds,
    currentPage,
    initialPauseId = null,
    startTime = 0,
    examTitle = "",
    governmentExamsSlug = "",
    guestAction = "",
    stopTimer,
    onSavingChange,
    onSubmittedChange,
    onPausedChange,
}) {
    const router = useRouter();

    /* =========================================
       REFS
    ========================================= */

    const requestRef = useRef(false);
    const timeoutHandledRef = useRef(false);

    /* =========================================
       STATE
    ========================================= */

    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [pauseId, setPauseId] = useState(
        initialPauseId || null
    );

    const [isPaused, setIsPaused] = useState(false);

    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    const [resultModalOpen, setResultModalOpen] =
        useState(false);

    const [submittedResult, setSubmittedResult] =
        useState(null);

    const [resultLoading, setResultLoading] =
        useState(false);

    /* =========================================
       UPDATE STATES
    ========================================= */

    const updateSaving = useCallback(
        (value) => {
            setSaving(value);
            onSavingChange?.(value);
        },
        [onSavingChange]
    );

    const updateSubmitted = useCallback(
        (value) => {
            setSubmitted(value);
            onSubmittedChange?.(value);
        },
        [onSubmittedChange]
    );

    const updatePaused = useCallback(
        (value) => {
            setIsPaused(value);
            onPausedChange?.(value);
        },
        [onPausedChange]
    );

    /* =========================================
       CALCULATE RESULT
    ========================================= */

    const getCurrentResult = useCallback(
        () =>
            calculateMockResult({
                questions,
                answers: answersRef?.current || {},
            }),
        [questions, answersRef]
    );

    /* =========================================
       BUILD ATTEMPT PAYLOAD
    ========================================= */

    const buildPayload = useCallback(
        ({
            examStatus,
            result,
            completedAt,
        }) =>
            buildMockAttemptPayload({
                cid,
                examId,
                examType,
                exam,
                questions,
                answers: answersRef?.current || {},
                remainingSeconds,
                startTime,
                completedAt,
                examStatus,
                result,
            }),
        [
            cid,
            examId,
            examType,
            exam,
            questions,
            answersRef,
            remainingSeconds,
            startTime,
        ]
    );

    /* =========================================
       FETCH SAVED RESULT
    ========================================= */

    const fetchDatabaseResult = useCallback(
        async (savedAttemptId) => {
            setResultLoading(true);

            try {
                const response = await postJson(
                    "/api/exam-attempt/analytics-details",
                    {
                        cid,
                        id: savedAttemptId,
                        exam_type: examType,
                    }
                );

                const databaseResult =
                    getDatabaseResult(response);

                if (!databaseResult) {
                    throw new Error(
                        "Saved result was not returned."
                    );
                }

                return databaseResult;
            } finally {
                setResultLoading(false);
            }
        },
        [cid, examType]
    );

    /* =========================================
       SAVE PAUSE
    ========================================= */

    const savePause = useCallback(async () => {
        if (
            requestRef.current ||
            submitted ||
            remainingSeconds <= 0
        ) {
            return;
        }

        requestRef.current = true;
        updateSaving(true);

        setSaveError("");
        setSaveMessage("");

        try {
            const payload = buildPayload({
                examStatus: "pause",
            });

            let savedPauseId = pauseId;

            if (savedPauseId) {
                await postJson(
                    "/api/exam-attempt/update",
                    {
                        ...payload,
                        pauseid: String(savedPauseId),
                    }
                );
            } else {
                const created = await postJson(
                    "/api/exam-attempt/create",
                    payload
                );

                savedPauseId = getAttemptId(created);

                if (!savedPauseId) {
                    throw new Error(
                        "Pause ID was not returned."
                    );
                }

                setPauseId(savedPauseId);
            }

            try {
                localStorage.setItem(
                    `exam_draft_${uid}_${cid}_${examType}_${examId}`,
                    JSON.stringify({
                        pauseId: savedPauseId,
                        answers: answersRef?.current || {},
                        remainingSeconds,
                        currentPage,
                    })
                );
            } catch (storageError) {
                console.warn(
                    "Unable to save local exam draft:",
                    storageError
                );
            }

            updatePaused(true);
            clearGuestExamHandoff();

            setSaveMessage(
                "Exam paused successfully."
            );
        } catch (error) {
            console.error(
                "PAUSE MOCK TEST:",
                error
            );

            setSaveError(
                error?.message ||
                "Unable to pause exam."
            );
        } finally {
            requestRef.current = false;
            updateSaving(false);
        }
    }, [
        submitted,
        remainingSeconds,
        getCurrentResult,
        buildPayload,
        pauseId,
        answersRef,
        uid,
        cid,
        examType,
        examId,
        currentPage,
        updatePaused,
        updateSaving,
    ]);

    /* =========================================
       FINISH EXAM
    ========================================= */

    const finishExam = useCallback(
        async ({ timeout = false } = {}) => {
            if (
                requestRef.current ||
                submitted
            ) {
                return;
            }

            requestRef.current = true;
            updateSaving(true);

            setSaveError("");
            setSaveMessage("");

            try {
                /* =================================
                   CALCULATE SCORE
                ================================= */

                const calculated =
                    getCurrentResult();

                /* =================================
                   GET OR CREATE ATTEMPT ID
                ================================= */

                const finalPayload =
                    buildPayload({
                        examStatus: "finish",
                        result: calculated,
                        completedAt: Date.now(),
                    });

                let finalPauseId = pauseId;

                if (finalPauseId) {
                    await postJson(
                        "/api/exam-attempt/update",
                        {
                            ...finalPayload,
                            pauseid: String(finalPauseId),
                        }
                    );
                } else {
                    const createResult =
                        await postJson(
                            "/api/exam-attempt/create",
                            finalPayload
                        );

                    finalPauseId =
                        getAttemptId(createResult);

                    if (!finalPauseId) {
                        throw new Error(
                            "Saved attempt ID was not returned."
                        );
                    }

                    setPauseId(finalPauseId);
                }

                /* =================================
                   SUBMISSION SUCCESSFUL
                ================================= */

                updateSubmitted(true);
                updatePaused(false);

                stopTimer?.();

                try {
                    clearGuestExamHandoff();
                } catch (storageError) {
                    console.warn(
                        "Unable to clear guest handoff:",
                        storageError
                    );
                }

                try {
                    localStorage.removeItem(
                        `exam_draft_${uid}_${cid}_${examType}_${examId}`
                    );
                } catch (storageError) {
                    console.warn(
                        "Unable to clear exam draft:",
                        storageError
                    );
                }

                /* =================================
                   LOCAL RESULT
                ================================= */

                const localResult = {
                    id: finalPauseId,
                    pauseid: finalPauseId,
                    exam_id: examId,
                    exam_type: examType,
                    exam_status: "finish",

                    exam_name: getMockExamTitle({
                        exam,
                        fallback: examTitle,
                    }),

                    total_questions: questions.length,

                    total_mark: getExamTotalMark(
                        exam,
                        questions.length
                    ),

                    answer_array:
                        calculated.answerArray,

                    user_answers:
                        calculated.userAnswers,

                    total_attempted:
                        calculated.totalAttempted,

                    total_correct:
                        calculated.totalCorrect,

                    total_wrong:
                        calculated.totalWrong,

                    user_score:
                        calculated.userScore,

                    minus_mark:
                        calculated.minusMark,
                };

                /* =================================
                   GET DATABASE RESULT
                ================================= */

                let resultForModal = localResult;
                let resultDetailsLoaded = true;

                try {
                    const databaseResult =
                        await fetchDatabaseResult(
                            finalPauseId
                        );

                    resultForModal = {
                        ...databaseResult,
                        // Keep counts and score calculated from this submission;
                        // older analytics rows may contain empty result fields.
                        ...localResult,

                        // Preserve the actual saved
                        // attempt ID for navigation.
                        id: finalPauseId,
                        pauseid: finalPauseId,
                    };
                } catch (resultError) {
                    console.error(
                        "RESULT DETAILS ERROR:",
                        resultError
                    );

                    resultDetailsLoaded = false;

                    setSaveMessage(
                        "Exam submitted. Showing the calculated result; saved analytics details are unavailable."
                    );
                }

                /* =================================
                   SHOW RESULT MODAL
                ================================= */

                setSubmittedResult(resultForModal);

                if (resultDetailsLoaded) {
                    setSaveMessage(
                        timeout
                            ? "Time is over. Exam submitted automatically."
                            : "Exam submitted successfully."
                    );
                }

                setResultModalOpen(true);
            } catch (error) {
                console.error(
                    "FINISH MOCK TEST:",
                    error
                );

                if (timeout) {
                    timeoutHandledRef.current = false;
                }

                setSaveError(
                    error?.message ||
                    "Unable to submit exam."
                );
            } finally {
                requestRef.current = false;
                updateSaving(false);
            }
        },
        [
            submitted,
            getCurrentResult,
            pauseId,
            buildPayload,
            fetchDatabaseResult,
            stopTimer,
            exam,
            examId,
            examTitle,
            examType,
            questions.length,
            uid,
            cid,
            updatePaused,
            updateSaving,
            updateSubmitted,
        ]
    );

    /* =========================================
       AUTO SUBMIT WHEN TIMER ENDS
    ========================================= */

    useEffect(() => {
        if (
            remainingSeconds !== 0 ||
            submitted ||
            saving ||
            isPaused ||
            timeoutHandledRef.current
        ) {
            return;
        }

        if (!exam || !questions.length) {
            return;
        }

        timeoutHandledRef.current = true;

        const timer = window.setTimeout(() => {
            void finishExam({
                timeout: true,
            });
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        remainingSeconds,
        submitted,
        saving,
        isPaused,
        exam,
        questions,
        finishExam,
    ]);

    /* =========================================
       PAUSE / RESUME BUTTON
    ========================================= */

    function handlePause() {
        if (
            submitted ||
            saving ||
            remainingSeconds <= 0
        ) {
            return;
        }

        if (isPaused) {
            updatePaused(false);

            setSaveError("");

            setSaveMessage(
                "Exam resumed."
            );

            return;
        }

        void savePause();
    }

    /* =========================================
       SUBMIT BUTTON
    ========================================= */

    function handleSubmit() {
        if (
            saving ||
            submitted ||
            requestRef.current
        ) {
            return;
        }

        void finishExam({
            timeout: false,
        });
    }

    /* =========================================
       CLOSE RESULT MODAL
    ========================================= */

    function handleResultClose() {
        // Close only.
        // Do not navigate automatically.
        setResultModalOpen(false);
    }

    /* =========================================
       VIEW EXAM ANALYSIS
    ========================================= */

    function handleViewAnalysis() {
        const savedAttemptId =
            pauseId ||
            getAttemptId(submittedResult);

        if (!savedAttemptId) {
            setSaveError(
                "Saved attempt ID is missing. Unable to open exam analysis."
            );
            return;
        }

        const resolvedExamTitle =
            getMockExamTitle({
                exam,
                submittedResult,
                fallback: examTitle,
            });

        const params =
            new URLSearchParams({
                attemptId: String(
                    savedAttemptId
                ),

                examType: "mock",

                ...(resolvedExamTitle
                    ? {
                        title: resolvedExamTitle,
                    }
                    : {}),
            });

        const analysisPath =
            `/dashboard/${governmentExamsSlug}` +
            `/exam-analysis?${params.toString()}`;

        setSaveError("");
        setResultModalOpen(false);

        router.push(analysisPath);
    }

    /* =========================================
       RETURN
    ========================================= */

    return {
        saving,
        submitted,

        pauseId,
        isPaused,

        saveMessage,
        saveError,

        resultModalOpen,
        submittedResult,
        resultLoading,

        handlePause,
        handleSubmit,

        handleResultClose,
        handleViewAnalysis,

        finishExam,
    };
}
