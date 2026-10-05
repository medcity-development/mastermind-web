"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    buildPerformanceSummary,
    EXAM_TYPES,
    getTimestamp,
    loadTypeAttempts,
} from "../utils/performanceAnalysisUtils";

export default function usePerformanceAnalysis({
    cid,
    uid,
}) {
    const [
        attempts,
        setAttempts,
    ] = useState([]);

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

    useEffect(() => {
        let cancelled =
            false;

        async function load() {
            if (
                !cid ||
                !uid
            ) {
                setAttempts([]);
                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError("");

                const results =
                    await Promise.allSettled(
                        EXAM_TYPES.map(
                            (type) =>
                                loadTypeAttempts({
                                    cid,
                                    uid,

                                    examType:
                                        type.examType,

                                    examLabel:
                                        type.label,
                                })
                        )
                    );

                const attemptsList =
                    results
                        .filter(
                            (result) =>
                                result.status ===
                                "fulfilled"
                        )
                        .flatMap(
                            (result) =>
                                result.value
                        )
                        .sort(
                            (first, second) =>
                                getTimestamp(
                                    second
                                ) -
                                getTimestamp(
                                    first
                                )
                        );

                const errors =
                    results
                        .filter(
                            (result) =>
                                result.status ===
                                "rejected"
                        )
                        .map(
                            (result) =>
                                result.reason
                                    ?.message
                        )
                        .filter(Boolean)
                        .join(" ");

                if (!cancelled) {
                    setAttempts(
                        attemptsList
                    );

                    setError(
                        errors
                    );
                }
            } catch (loadError) {
                console.error(
                    "Performance Analysis:",
                    loadError
                );

                if (!cancelled) {
                    setAttempts([]);

                    setError(
                        loadError?.message ||
                        "Unable to load performance."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [
        cid,
        uid,
    ]);

    /* =======================================================
       SUMMARY
    ======================================================= */

    const summary =
        useMemo(
            () =>
                buildPerformanceSummary(
                    attempts
                ),
            [
                attempts,
            ]
        );

    return {
        attempts,
        summary,
        loading,
        error,
    };
}