"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    calculateMockResult,
    getAttemptId,
    getDatabaseResult,
    getExamType,
    getExamTotalMark,
    postJson,
} from "../utils/mockTestUtils";

import {
    buildMockAttemptPayload,
    getMockExamTitle,
} from "../utils/mockAttemptUtils";
import { clearGuestExamHandoff } from "@/lib/guestExamHandoff";

export default function useMockExamAttempt({
    uid,
    cid,
    examId,
    examType,

    exam,
    questions = [],

    answersRef,

    remainingSeconds,
    currentPage,

    initialPauseId = null,
    startTime = 0,

    examTitle = "",

    governmentExamsSlug,
    guestAction = "",

    stopTimer,

    onSavingChange,
    onSubmittedChange,
    onPausedChange,
}) {
    const router =
        useRouter();

    /* =======================================================
       REFS
    ======================================================= */

    const requestRef =
        useRef(false);

    const timeoutHandledRef =
        useRef(false);

    /* =======================================================
       STATE
    ======================================================= */

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        submitted,
        setSubmitted,
    ] = useState(false);

    const [
        pauseId,
        setPauseId,
    ] = useState(
        initialPauseId || null
    );

    const [
        isPaused,
        setIsPaused,
    ] = useState(false);

    const [
        saveMessage,
        setSaveMessage,
    ] = useState("");

    const [
        saveError,
        setSaveError,
    ] = useState("");

    const [
        resultModalOpen,
        setResultModalOpen,
    ] = useState(false);

    const [
        submittedResult,
        setSubmittedResult,
    ] = useState(null);

    const [
        resultLoading,
        setResultLoading,
    ] = useState(false);

    /* =======================================================
       SYNC EXTERNAL STATES
    ======================================================= */

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

    /* =======================================================
       CALCULATE
    ======================================================= */

    const getCurrentResult =
        useCallback(
            () =>
                calculateMockResult({
                    questions,

                    answers:
                        answersRef?.current ||
                        {},
                }),
            [
                questions,
                answersRef,
            ]
        );

    /* =======================================================
       PAYLOAD
    ======================================================= */

    const buildPayload =
        useCallback(
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
                remainingSeconds,
                startTime,
            ]
        );

    /* =======================================================
       FETCH SAVED DB RESULT
    ======================================================= */

    const fetchDatabaseResult =
        useCallback(
            async (
                savedAttemptId
            ) => {
                setResultLoading(
                    true
                );

                try {
                    const response =
                        await postJson(
                            "/api/exam-attempt/analytics-details",
                            {
                                cid,

                                id:
                                    savedAttemptId,

                                exam_type:
                                    examType,
                            }
                        );

                    const databaseResult =
                        getDatabaseResult(
                            response
                        );

                    if (
                        !databaseResult
                    ) {
                        throw new Error(
                            "Saved result was not returned."
                        );
                    }

                    return databaseResult;
                } finally {
                    setResultLoading(
                        false
                    );
                }
            },
            [
                cid,
                examType,
            ]
        );

    /* =======================================================
       PAUSE
    ======================================================= */

    const savePause =
        useCallback(
            async () => {
                if (
                    requestRef.current ||
                    submitted ||
                    remainingSeconds <= 0
                ) {
                    return;
                }

                try {
                    requestRef.current =
                        true;

                    updateSaving(
                        true
                    );

                    setSaveError("");
                    setSaveMessage("");

                    const calculated =
                        getCurrentResult();

                    const payload =
                        buildPayload({
                            examStatus:
                                "pause",

                            result:
                                calculated,
                        });

                    let savedPauseId = pauseId;
                    if (pauseId) {
                        await postJson(
                            "/api/exam-attempt/update",
                            {
                                ...payload,

                                pauseid:
                                    pauseId,
                            }
                        );
                    } else {
                        const created =
                            await postJson(
                                "/api/exam-attempt/create",
                                payload
                            );

                        const createdId =
                            getAttemptId(
                                created
                            );

                        if (!createdId) {
                            throw new Error(
                                "Pause id was not returned."
                            );
                        }

                        setPauseId(
                            createdId
                        );
                        savedPauseId = createdId;
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
                    } catch (error) {
                        console.warn("Save mock exam resume draft:", error);
                    }

                    updatePaused(
                        true
                    );
                    clearGuestExamHandoff();

                    setSaveMessage(
                        "Exam paused successfully."
                    );
                } catch (
                error
                ) {
                    console.error(
                        "PAUSE MOCK TEST:",
                        error
                    );

                    setSaveError(
                        error?.message ||
                        "Unable to pause exam."
                    );
                } finally {
                    requestRef.current =
                        false;

                    updateSaving(
                        false
                    );
                }
            },
            [
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
            ]
        );

    /* =======================================================
       FINISH EXAM
    ======================================================= */

    const finishExam =
        useCallback(
            async ({
                timeout = false,
            } = {}) => {
                if (
                    requestRef.current ||
                    submitted
                ) {
                    return;
                }

                if (
                    !timeout &&
                    remainingSeconds <= 0
                ) {
                    return;
                }

                try {
                    requestRef.current =
                        true;

                    updateSaving(
                        true
                    );

                    setSaveError("");
                    setSaveMessage("");

                    /* ===============================================
                       CALCULATE CURRENT RESULT
                    =============================================== */

                    const calculated =
                        getCurrentResult();

                    /* ===============================================
                       ENSURE ATTEMPT ID
                    =============================================== */

                    let finalPauseId =
                        pauseId;

                    if (
                        !finalPauseId
                    ) {
                        const createPayload =
                            buildPayload({
                                examStatus:
                                    "pause",

                                result:
                                    calculated,
                            });

                        const createResult =
                            await postJson(
                                "/api/exam-attempt/create",
                                createPayload
                            );

                        finalPauseId =
                            getAttemptId(
                                createResult
                            );

                        if (
                            !finalPauseId
                        ) {
                            throw new Error(
                                "Saved attempt id was not returned."
                            );
                        }

                        setPauseId(
                            finalPauseId
                        );
                    }

                    /* ===============================================
                       FINAL UPDATE
                    =============================================== */

                    const finalPayload =
                        buildPayload({
                            examStatus:
                                "finish",

                            result:
                                calculated,

                            completedAt:
                                Date.now(),
                        });

                    const updatePayload = {
                        ...finalPayload,

                        pauseid:
                            String(
                                finalPauseId
                            ),
                    };

                    console.log(
                        "FINAL MOCK RESULT PAYLOAD:",
                        updatePayload
                    );

                    await postJson(
                        "/api/exam-attempt/update",
                        updatePayload
                    );
                    clearGuestExamHandoff();

                    /* ===============================================
                       STOP EXAM
                    =============================================== */

                    updateSubmitted(
                        true
                    );

                    updatePaused(
                        false
                    );

                    stopTimer?.();

                    /* ===============================================
                       READ SAVED RESULT
                    =============================================== */

                    const localResult = {
                        id: finalPauseId,
                        exam_id: examId,
                        exam_type: examType,
                        exam_name: getMockExamTitle({
                            exam,
                            fallback: examTitle,
                        }),
                        total_questions: questions.length,
                        total_mark: getExamTotalMark(exam, questions.length),
                        total_attempted: calculated.totalAttempted,
                        total_correct: calculated.totalCorrect,
                        total_wrong: calculated.totalWrong,
                        user_score: calculated.userScore,
                        minus_mark: calculated.minusMark,
                    };
                    let resultForModal = localResult;
                    let resultDetailsLoaded = true;
                    try {
                        resultForModal = {
                            ...localResult,
                            ...await fetchDatabaseResult(finalPauseId),
                        };
                    } catch (resultError) {
                        console.error(
                            "MOCK TEST SAVED BUT RESULT DETAILS COULD NOT BE LOADED:",
                            resultError
                        );
                        resultDetailsLoaded = false;
                        setSaveMessage(
                            "Exam submitted. Showing the calculated result; saved analytics details are unavailable."
                        );
                    }

                    setSubmittedResult(resultForModal);

                    if (resultDetailsLoaded) {
                        setSaveMessage(
                            timeout
                                ? "Time is over. Exam submitted automatically."
                                : "Exam submitted successfully."
                        );
                    }

                    setResultModalOpen(
                        true
                    );
                } catch (
                error
                ) {
                    console.error(
                        "FINISH MOCK TEST:",
                        error
                    );

                    if (timeout) {
                        timeoutHandledRef.current =
                            false;
                    }

                    setSaveError(
                        error?.message ||
                        "Unable to submit exam."
                    );
                } finally {
                    requestRef.current =
                        false;

                    updateSaving(
                        false
                    );
                }
            },
            [
                submitted,
                remainingSeconds,

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
                updatePaused,
                updateSaving,
                updateSubmitted,
            ]
        );

    /* =======================================================
       TIMER AUTO SUBMIT
    ======================================================= */

    useEffect(() => {
        if (
            remainingSeconds !==
            0 ||
            submitted ||
            saving ||
            isPaused ||
            timeoutHandledRef.current
        ) {
            return;
        }

        if (
            !exam ||
            !questions.length
        ) {
            return;
        }

        timeoutHandledRef.current =
            true;

        const timer = window.setTimeout(() => {
            void finishExam({
                timeout: true,
            });
        }, 0);
        return () => window.clearTimeout(timer);
    }, [
        remainingSeconds,
        submitted,
        saving,
        isPaused,
        exam,
        questions,
        finishExam,
    ]);

    /* =======================================================
       PAUSE / RESUME
    ======================================================= */

    function handlePause() {
        if (
            submitted ||
            saving ||
            remainingSeconds <= 0
        ) {
            return;
        }

        if (isPaused) {
            updatePaused(
                false
            );

            setSaveError("");

            setSaveMessage(
                "Exam resumed."
            );

            return;
        }

        savePause();
    }

    /* =======================================================
       SUBMIT
    ======================================================= */

    function handleSubmit() {
        finishExam({
            timeout: false,
        });
    }

    /* =======================================================
       RESULT CLOSE
    ======================================================= */

    function handleResultClose() {
        setResultModalOpen(
            false
        );

        if (guestAction === "submit") {
            router.replace(`/dashboard/${governmentExamsSlug}`);
            return;
        }

        const savedAttemptId =
            getAttemptId(
                submittedResult
            ) ??
            pauseId;

        const savedExamType =
            getExamType(
                submittedResult
            ) ||
            examType;

        const resolvedExamTitle =
            getMockExamTitle({
                exam,
                submittedResult,
                fallback:
                    examTitle,
            });

        if (
            !savedAttemptId ||
            !savedExamType
        ) {
            router.replace(
                `/dashboard/${governmentExamsSlug}/exam-analysis`
            );

            return;
        }

        const params =
            new URLSearchParams({
                attemptId:
                    String(
                        savedAttemptId
                    ),

                examType:
                    savedExamType,

                ...(resolvedExamTitle
                    ? {
                        title:
                            resolvedExamTitle,
                    }
                    : {}),
            });

        router.replace(
            `/dashboard/${governmentExamsSlug}/exam-analysis?${params.toString()}`
        );
    }

    function handleViewAnalysis() {
        setResultModalOpen(false);
        router.replace(
            `/dashboard/${governmentExamsSlug}/exam-attempted`
        );
    }

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
