"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import useMockExamLoader from "./useMockExamLoader";
import useMockExamAnswers from "./useMockExamAnswers";
import useMockExamPagination from "./useMockExamPagination";
import useMockExamTimer from "./useMockExamTimer";
import useMockExamAttempt from "./useMockExamAttempt";

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
    governmentExamsSlug = "",
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
    ] = useState("mock");

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
                    "mock"
                );

                setInitialPauseId(
                    null
                );

                setSubmitted(
                    false
                );

                setSaving(
                    false
                );

                setIsPaused(
                    false
                );

                /* ===============================================
                   API
                =============================================== */

                const data =
                    await loadMockExam();

                if (cancelled) {
                    return;
                }

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
                        "mock"
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

                /* ===============================================
                   RESTORE ANSWERS
                =============================================== */

                answersApi.restoreAnswers(
                    Array.isArray(
                        data?.restoredAnswers
                    )
                        ? data.restoredAnswers
                        : []
                );

                /* ===============================================
                   TIMER
                =============================================== */

                const initialRemaining =
                    Number(
                        data?.initialRemaining
                    );

                timer.startTimer(
                    Number.isFinite(
                        initialRemaining
                    ) &&
                        initialRemaining >=
                        0
                        ? initialRemaining
                        : 0
                );
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
            setLoading(
                false
            );

            setError(
                "Required exam information is missing."
            );
        }

        return () => {
            cancelled = true;

            timer.stopTimer?.();
        };
    }, [
        examId,
        uid,
        cid,
        loadMockExam,
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

    /* =======================================================
       ATTEMPT ACTIONS
    ======================================================= */

    const attempt =
        useMockExamAttempt({
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

            initialPauseId,

            /* ===============================================
               THIS IS THE REAL EXAM NAME
            =============================================== */

            examTitle:
                resolvedExamTitle,

            governmentExamsSlug,

            stopTimer:
                timer.stopTimer,

            onSavingChange:
                setSaving,

            onSubmittedChange:
                setSubmitted,

            onPausedChange:
                setIsPaused,
        });

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
        `/dashboard/${governmentExamsSlug}/mock-tests/${examId}${resolvedExamTitle
            ? `?title=${encodeURIComponent(
                resolvedExamTitle
            )}`
            : ""
        }`;

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