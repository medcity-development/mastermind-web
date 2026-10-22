"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import useMockExamLoader from "./useMockExamLoader";
import useMockExamAnswers from "./useMockExamAnswers";
import useMockExamPagination from "./useMockExamPagination";
import useMockExamTimer from "./useMockExamTimer";
import useMockExamAttempt from "./useMockExamAttempt";
import { readGuestExamHandoff } from "@/lib/guestExamHandoff";
import { timestampToMilliseconds } from "@/lib/examAttemptData";

/* =========================================================
   HELPERS
========================================================= */

function getRealExamTitle({
    exam,
    fallback = "",
}) {
    const candidates = [
        exam?.exam_name,
        exam?.examName,

        exam?.exam_title,
        exam?.examTitle,

        exam?.test_name,
        exam?.testName,

        exam?.mock_name,
        exam?.mockName,

        exam?.title,
        exam?.name,

        fallback,
    ];

    for (
        const candidate of candidates
    ) {
        const value =
            String(
                candidate ?? ""
            ).trim();

        if (value) {
            return value;
        }
    }

    return "";
}

/* =========================================================
   HOOK
========================================================= */

export default function useMockTestExam({
    examId,
    uid,
    cid,
    examTitle = "",
    examType: requestedExamType = "mock",
    governmentExamsSlug = "",
    guestAction = "",
}) {
    /* =======================================================
       EXAM STATE
    ======================================================= */

    const [
        exam,
        setExam,
    ] = useState(null);

    const [
        questions,
        setQuestions,
    ] = useState([]);

    const [
        imagePath,
        setImagePath,
    ] = useState("");

    const [
        examType,
        setExamType,
    ] = useState(requestedExamType);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        initialPauseId,
        setInitialPauseId,
    ] = useState(null);
    const [
        attemptStartTime,
        setAttemptStartTime,
    ] = useState(0);

    /* =======================================================
       ATTEMPT STATE
    ======================================================= */

    const [
        submitted,
        setSubmitted,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        isPaused,
        setIsPaused,
    ] = useState(false);

    const [
        restoredPage,
        setRestoredPage,
    ] = useState(1);
    const guestHandoffActionRef = useRef("");
    const guestActionHandledRef = useRef(false);

    /* =======================================================
       ANSWERS
    ======================================================= */

    const answersApi =
        useMockExamAnswers({
            questions,

            disabled:
                false,
        });

    /* =======================================================
       LOADER
    ======================================================= */

    const {
        loadMockExam,
    } =
        useMockExamLoader({
            examId,
            uid,
            cid,
            examType: requestedExamType,
        });

    /* =======================================================
       TIMER
    ======================================================= */

    const timer =
        useMockExamTimer({
            submitted,
            saving,
            isPaused,
        });
    const restoreAnswers = answersApi.restoreAnswers;
    const startTimer = timer.startTimer;
    const stopTimer = timer.stopTimer;

    /* =======================================================
       REAL EXAM TITLE
  
       Priority:
       backend exam object
       ->
       title passed from selected card
    ======================================================= */

    const resolvedExamTitle =
        useMemo(
            () =>
                getRealExamTitle({
                    exam,

                    fallback:
                        examTitle,
                }),
            [
                exam,
                examTitle,
            ]
        );

    /* =======================================================
       LOAD EXAM
    ======================================================= */

    useEffect(() => {
        let cancelled =
            false;

        async function load() {
            try {
                /* ===============================================
                   RESET
                =============================================== */

                setLoading(true);
                setError("");

                setExam(null);

                setQuestions([]);

                setImagePath("");

                setExamType(
                    requestedExamType
                );

                setInitialPauseId(
                    null
                );
                setAttemptStartTime(0);

                setSubmitted(
                    false
                );

                setSaving(
                    false
                );

                setIsPaused(
                    false
                );
                guestHandoffActionRef.current = "";
                guestActionHandledRef.current = false;

                /* ===============================================
                   API
                =============================================== */

                const data =
                    await loadMockExam();

                const guestAttempt =
                    readGuestExamHandoff({
                        examId,
                        examType: requestedExamType,
                        governmentExamsSlug,
                    });

                if (cancelled) {
                    return;
                }
                const matchingGuestAttempt =
                    guestAttempt?.action === guestAction
                        ? guestAttempt
                        : null;

                /* ===============================================
                   EXAM
                =============================================== */

                setExam(
                    data?.exam ??
                    null
                );

                /* ===============================================
                   QUESTIONS
                =============================================== */

                setQuestions(
                    Array.isArray(
                        data?.questions
                    )
                        ? data.questions
                        : []
                );

                /* ===============================================
                   IMAGE PATH
                =============================================== */

                setImagePath(
                    String(
                        data?.imagePath ??
                        ""
                    )
                );

                /* ===============================================
                   EXAM TYPE
                =============================================== */

                const loadedExamType =
                    String(
                        data?.examType ??
                        data?.exam?.exam_type ??
                        data?.exam?.examType ??
                        requestedExamType
                    )
                        .trim()
                        .toLowerCase();

                setExamType(
                    loadedExamType ||
                    "mock"
                );

                /* ===============================================
                   EXISTING PAUSE ID
                =============================================== */

                const loadedPauseId =
                    data?.pauseId ??
                    data?.exam?.pauseid ??
                    data?.exam?.pause_id ??
                    null;

                setInitialPauseId(
                    loadedPauseId
                );
                setAttemptStartTime(
                    timestampToMilliseconds(matchingGuestAttempt?.startTime) ??
                    timestampToMilliseconds(data?.startTime) ??
                    Date.now()
                );

                /* ===============================================
                   RESTORE ANSWERS
                =============================================== */

                restoreAnswers(
                    guestAttempt?.answers ||
                    data?.restoredAnswers ||
                    {}
                );
                setRestoredPage(
                    Number(guestAttempt?.currentPage ?? data?.currentPage) || 1
                );

                /* ===============================================
                   TIMER
                =============================================== */

                const initialRemaining =
                    Number(
                        data?.initialRemaining
                    );
                const guestRemaining =
                    Number(
                        guestAttempt?.remainingSeconds
                    );

                startTimer(
                    Number.isFinite(
                        guestRemaining
                    ) &&
                        guestRemaining >=
                        0
                        ? guestRemaining
                        : Number.isFinite(initialRemaining) && initialRemaining >= 0
                            ? initialRemaining
                            : 0
                );

                if (guestAttempt?.action === "pause" || guestAttempt?.action === "submit") {
                    guestHandoffActionRef.current = guestAttempt.action;
                }
            } catch (
            loadError
            ) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "MOCK EXAM LOAD:",
                    loadError
                );

                setExam(null);

                setQuestions([]);

                setError(
                    loadError?.message ||
                    "Unable to load exam."
                );
            } finally {
                if (!cancelled) {
                    setLoading(
                        false
                    );
                }
            }
        }

        if (
            examId &&
            uid &&
            cid
        ) {
            load();
        } else {
            Promise.resolve().then(() => {
                if (!cancelled) {
                    setLoading(false);
                    setError("Required exam information is missing.");
                }
            });
        }

        return () => {
            cancelled = true;

            stopTimer?.();
        };
    }, [
        examId,
        uid,
        cid,
        guestAction,
        loadMockExam,
        restoreAnswers,
        startTimer,
        stopTimer,
        governmentExamsSlug,
        requestedExamType,
    ]);

    /* =======================================================
       PAGINATION
    ======================================================= */

    const pagination =
        useMockExamPagination({
            questions,

            disabled:
                saving ||
                submitted ||
                isPaused ||
                timer.timeEnded,
        });

    const setPaginationPage =
        pagination.setCurrentPage;
    const paginationPageCount =
        pagination.totalPages;

    useEffect(() => {
        if (!loading) {
            setPaginationPage(
                Math.max(
                    1,
                    Math.min(restoredPage, paginationPageCount)
                )
            );
        }
    }, [
        loading,
        restoredPage,
        paginationPageCount,
        setPaginationPage,
    ]);

    /* =======================================================
       ATTEMPT ACTIONS
    ======================================================= */

    const attempt =
        useMockExamAttempt({
            uid,

            cid,

            examId,

            examType:
                examType ||
                "mock",

            exam,

            questions,

            answersRef:
                answersApi.answersRef,

            remainingSeconds:
                timer.remainingSeconds,

            currentPage:
                pagination.currentPage,

            initialPauseId,
            startTime:
                attemptStartTime,
            /* ===============================================
               THIS IS THE REAL EXAM NAME
            =============================================== */

            examTitle:
                resolvedExamTitle,
                requestedExamType,

            governmentExamsSlug,
            guestAction,

            stopTimer:
                timer.stopTimer,

            onSavingChange:
                setSaving,

            onSubmittedChange:
                setSubmitted,

            onPausedChange:
                setIsPaused,
        });
    const {
        handlePause: pauseAttempt,
        handleSubmit: submitAttempt,
        finishExam: finishExamAttempt,
    } = attempt;

    useEffect(() => {
        if (
            loading ||
            guestActionHandledRef.current ||
            guestHandoffActionRef.current !== guestAction ||
            (guestAction !== "pause" && guestAction !== "submit")
        ) {
            return;
        }

        guestActionHandledRef.current = true;
        if (guestAction === "pause") {
            pauseAttempt();
        } else {
            finishExamAttempt({
                timeout: timer.remainingSeconds <= 0,
            });
        }
    }, [
        loading,
        guestAction,
        pauseAttempt,
        finishExamAttempt,
        timer.remainingSeconds,
    ]);

    /* =======================================================
       DISABLE INTERACTION
    ======================================================= */

    const interactionDisabled =
        submitted ||
        saving ||
        isPaused ||
        timer.timeEnded;

    /* =======================================================
       DETAILS PATH
    ======================================================= */

    const dashboardDetailsPath =
        `/dashboard/${governmentExamsSlug}/mock-tests/${examId}?${new URLSearchParams({
            type: examType || "mock",
            ...(resolvedExamTitle
                ? { title: resolvedExamTitle }
                : {}),
        })}`;

    /* =======================================================
       RETURN
    ======================================================= */

    return {
        /* EXAM */

        exam,

        examTitle:
            resolvedExamTitle,

        examType,

        questions,

        imagePath,

        /* ANSWERS */

        answers:
            answersApi.answers,

        answeredCount:
            answersApi
                .answeredCount,

        unansweredCount:
            answersApi
                .unansweredCount,

        /* LOADING */

        loading,

        error,

        /* PAGINATION */

        ...pagination,

        /* STATE */

        saving,

        submitted,

        isPaused,

        /* TIMER */

        remainingSeconds:
            timer.remainingSeconds,

        timeEnded:
            timer.timeEnded,

        /* ATTEMPT */

        ...attempt,

        /* ANSWER ACTION */

        handleAnswer:
            interactionDisabled
                ? () => { }
                : answersApi
                    .handleAnswer,

        /* COMMON */

        interactionDisabled,

        dashboardDetailsPath,
    };
}
