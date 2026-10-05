"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import ExamHistoryHeader from "./components/ExamHistoryHeader";
import ExamHistoryTabs from "./components/ExamHistoryTabs";
import AttemptedExamTable from "./components/AttemptedExamTable";
import ExamHistoryPagination from "./components/ExamHistoryPagination";

import {
    buildExamHistoryTabs,
    getAttemptExamName,
    getAttemptExamType,
    normalizeAttemptList,
    sortAttemptsNewestFirst,
} from "./utils/examHistoryUtils";

const ITEMS_PER_PAGE =
    10;

/* =========================================================
   JSON
========================================================= */

async function readJsonResponse(
    response
) {
    const raw =
        await response.text();

    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(
            raw
        );
    } catch {
        throw new Error(
            `Server returned invalid JSON. HTTP ${response.status}.`
        );
    }
}

/* =========================================================
   LOAD ONE TYPE
========================================================= */

async function loadExamType({
    cid,
    examType,
}) {
    try {
        const response =
            await fetch(
                "/api/exam-attempt/user-exams",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    cache:
                        "no-store",

                    body:
                        JSON.stringify({
                            cid,

                            exam_type:
                                examType,
                        }),
                }
            );

        const result =
            await readJsonResponse(
                response
            );

        if (!response.ok) {
            console.error(
                `Unable to load ${examType}:`,
                result
            );

            return [];
        }

        return normalizeAttemptList({
            response:
                result,

            examType,
        });
    } catch (error) {
        console.error(
            `EXAM HISTORY ${examType}:`,
            error
        );

        return [];
    }
}

/* =========================================================
   CLIENT
========================================================= */

export default function ExamHistoryClient({
    cid,
    examTypes = [],
    examName,
    governmentExamsSlug,
}) {
    const [
        attempts,
        setAttempts,
    ] = useState([]);

    const [
        activeTab,
        setActiveTab,
    ] = useState(
        "all"
    );

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    /* =======================================================
       LOAD
    ======================================================= */

    const loadHistory =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");

                    if (
                        !Array.isArray(
                            examTypes
                        ) ||
                        !examTypes.length
                    ) {
                        setAttempts(
                            []
                        );

                        return;
                    }

                    const results =
                        await Promise.all(
                            examTypes.map(
                                (
                                    examType
                                ) =>
                                    loadExamType({
                                        cid,
                                        examType,
                                    })
                            )
                        );

                    const merged =
                        results.flat();

                    const sorted =
                        sortAttemptsNewestFirst(
                            merged
                        );

                    setAttempts(
                        sorted
                    );

                    setCurrentPage(
                        1
                    );
                } catch (error) {
                    console.error(
                        "EXAM HISTORY:",
                        error
                    );

                    setAttempts(
                        []
                    );

                    setError(
                        error?.message ||
                        "Unable to load exam history."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                cid,
                examTypes,
            ]
        );

    /* =======================================================
       INITIAL
    ======================================================= */

    useEffect(() => {
        loadHistory();
    }, [
        loadHistory,
    ]);

    /* =======================================================
       TABS
    ======================================================= */

    const tabs =
        useMemo(
            () =>
                buildExamHistoryTabs(
                    attempts
                ),
            [
                attempts,
            ]
        );

    /* =======================================================
       VALID TAB
    ======================================================= */

    useEffect(() => {
        if (
            activeTab ===
            "all"
        ) {
            return;
        }

        const exists =
            tabs.some(
                (tab) =>
                    tab.key ===
                    activeTab
            );

        if (!exists) {
            setActiveTab(
                "all"
            );

            setCurrentPage(
                1
            );
        }
    }, [
        tabs,
        activeTab,
    ]);

    /* =======================================================
       FILTER
    ======================================================= */

    const filteredAttempts =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                return attempts.filter(
                    (
                        attempt
                    ) => {
                        const type =
                            getAttemptExamType(
                                attempt
                            );

                        if (
                            activeTab !==
                            "all" &&
                            type !==
                            activeTab
                        ) {
                            return false;
                        }

                        if (!query) {
                            return true;
                        }

                        const name =
                            getAttemptExamName(
                                attempt
                            )
                                .toLowerCase();

                        return (
                            name.includes(
                                query
                            ) ||
                            type.includes(
                                query
                            )
                        );
                    }
                );
            },
            [
                attempts,
                activeTab,
                search,
            ]
        );

    /* =======================================================
       PAGINATION
    ======================================================= */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredAttempts.length /
                ITEMS_PER_PAGE
            )
        );

    const safePage =
        Math.min(
            currentPage,
            totalPages
        );

    const startIndex =
        (safePage - 1) *
        ITEMS_PER_PAGE;

    const visibleAttempts =
        filteredAttempts.slice(
            startIndex,
            startIndex +
            ITEMS_PER_PAGE
        );

    /* =======================================================
       EVENTS
    ======================================================= */

    function handleTabChange(
        value
    ) {
        setActiveTab(
            value
        );

        setCurrentPage(
            1
        );
    }

    function handleSearch(
        value
    ) {
        setSearch(
            value
        );

        setCurrentPage(
            1
        );
    }

    function handlePageChange(
        page
    ) {
        if (
            page < 1 ||
            page >
            totalPages
        ) {
            return;
        }

        setCurrentPage(
            page
        );

        window.scrollTo({
            top: 0,

            behavior:
                "smooth",
        });
    }

    /* =======================================================
       UI
    ======================================================= */

    return (
        <div
            className="
        space-y-5
      "
        >
            <ExamHistoryHeader
                examName={
                    examName
                }
                search={
                    search
                }
                onSearch={
                    handleSearch
                }
                loading={
                    loading
                }
                onRefresh={
                    loadHistory
                }
            />

            <ExamHistoryTabs
                tabs={
                    tabs
                }
                activeTab={
                    activeTab
                }
                onChange={
                    handleTabChange
                }
            />

            {error ? (
                <div
                    className="
            rounded-[18px]
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            font-bold
            text-red-600
          "
                >
                    {error}
                </div>
            ) : null}

            <section
                className="
          overflow-hidden
          rounded-[24px]
          border
          border-[#d8e5f4]
          bg-white
          shadow-[0_15px_40px_rgba(15,23,42,0.05)]
        "
            >
                <AttemptedExamTable
                    attempts={
                        visibleAttempts
                    }
                    loading={
                        loading
                    }
                    startIndex={
                        startIndex
                    }
                    governmentExamsSlug={
                        governmentExamsSlug
                    }
                />

                {!loading &&
                    filteredAttempts.length >
                    0 ? (
                    <ExamHistoryPagination
                        currentPage={
                            safePage
                        }
                        totalPages={
                            totalPages
                        }
                        totalItems={
                            filteredAttempts.length
                        }
                        startIndex={
                            startIndex
                        }
                        itemsPerPage={
                            ITEMS_PER_PAGE
                        }
                        onPageChange={
                            handlePageChange
                        }
                    />
                ) : null}
            </section>
        </div>
    );
}