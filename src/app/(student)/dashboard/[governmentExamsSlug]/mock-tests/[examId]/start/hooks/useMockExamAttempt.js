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
    postJson,
} from "../utils/mockTestUtils";

import {
    buildMockAttemptPayload,
    getMockExamTitle,
} from "../utils/mockAttemptUtils";

export default function useMockExamAttempt({
    cid,
    examId,
    examType,

    exam,
    questions = [],

    answersRef,

    remainingSeconds,

    initialPauseId = null,

    examTitle = "",

    governmentExamsSlug,

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
        initialPauseId
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
       SYNC INITIAL PAUSE ID
    ======================================================= */

    useEffect(() => {
        setPauseId(
            initialPauseId ||
            null
        );
    }, [
        initialPauseId,
    ]);

    /* =======================================================
       SYNC EXTERNAL STATES
    ======================================================= */

    function updateSaving(
        value
    ) {
        setSaving(value);

        onSavingChange?.(
            value
        );
    }

    function updateSubmitted(
        value
    ) {
        setSubmitted(value);

        onSubmittedChange?.(
            value
        );
    }

    function updatePaused(
        value
    ) {
        setIsPaused(value);

        onPausedChange?.(
            value
        );
    }

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
            }) =>
                buildMockAttemptPayload({
                    cid,
                    examId,
                    examType,

                    exam,
                    questions,

                    remainingSeconds,

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
                    }

                    updatePaused(
                        true
                    );

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

                    const databaseResult =
                        await fetchDatabaseResult(
                            finalPauseId
                        );

                    setSubmittedResult(
                        databaseResult
                    );

                    setSaveMessage(
                        timeout
                            ? "Time is over. Exam submitted automatically."
                            : "Exam submitted successfully."
                    );

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

        finishExam({
            timeout: true,
        });
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

        finishExam,
    };
}