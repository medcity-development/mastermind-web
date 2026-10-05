import {
    useMemo,
    useState,
} from "react";

import {
    QUESTIONS_PER_PAGE,
} from "../utils/mockTestUtils";

export default function useMockExamPagination({
    questions = [],
    disabled = false,
}) {
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                questions.length /
                QUESTIONS_PER_PAGE
            )
        );

    const pageNumbers =
        useMemo(
            () =>
                Array.from(
                    {
                        length:
                            totalPages,
                    },
                    (
                        _,
                        index
                    ) =>
                        index + 1
                ),
            [
                totalPages,
            ]
        );

    const startIndex =
        (currentPage - 1) *
        QUESTIONS_PER_PAGE;

    const visibleQuestions =
        useMemo(
            () =>
                questions.slice(
                    startIndex,
                    startIndex +
                    QUESTIONS_PER_PAGE
                ),
            [
                questions,
                startIndex,
            ]
        );

    function handlePageChange(
        page
    ) {
        if (
            disabled ||
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

    return {
        currentPage,
        setCurrentPage,

        totalPages,
        pageNumbers,

        startIndex,
        visibleQuestions,

        handlePageChange,
    };
}