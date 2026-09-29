// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/[slug]/components/CurrentAffairsMonthViewer.jsx

"use client";

import {
    useEffect,
    useState,
} from "react";

import CurrentAffairsMonthHeader from "./CurrentAffairsMonthHeader";
import CurrentAffairsDateTabs from "./CurrentAffairsDateTabs";
import CurrentAffairsContent from "./CurrentAffairsContent";

export default function CurrentAffairsMonthViewer({
    cid,
    title,
    dates = [],
    examName,
    shortName,
    governmentExamsSlug,
}) {
    const firstDate =
        dates?.[0]?.date ??
        "";

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(
        firstDate
    );

    const [
        content,
        setContent,
    ] = useState([]);

    const [
        filePath,
        setFilePath,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        if (
            !cid ||
            !selectedDate
        ) {
            setContent([]);
            setFilePath("");

            return;
        }

        let cancelled =
            false;

        async function loadContent() {
            try {
                setLoading(true);
                setError("");

                const params =
                    new URLSearchParams({
                        cid:
                            String(cid),

                        date:
                            String(
                                selectedDate
                            ),
                    });

                const response =
                    await fetch(
                        `/api/current-affairs/data?${params.toString()}`,
                        {
                            cache:
                                "no-store",
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        result?.msg ||
                        "Unable to load current affairs."
                    );
                }

                if (cancelled) {
                    return;
                }

                setContent(
                    Array.isArray(
                        result?.data
                    )
                        ? result.data
                        : []
                );

                setFilePath(
                    result?.filePath ??
                    result?.file_path ??
                    ""
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "CURRENT AFFAIRS CONTENT ERROR:",
                    error
                );

                setContent([]);
                setFilePath("");

                setError(
                    error?.message ||
                    "Unable to load current affairs."
                );
            } finally {
                if (!cancelled) {
                    setLoading(
                        false
                    );
                }
            }
        }

        loadContent();

        return () => {
            cancelled = true;
        };
    }, [
        cid,
        selectedDate,
    ]);

    return (
        <div
            className="
        mx-auto
        w-full
        max-w-[1300px]
        px-4

        sm:px-6

        lg:px-8
      "
        >
            <CurrentAffairsMonthHeader
                title={title}
                examName={
                    examName
                }
                shortName={
                    shortName
                }
                backHref={
                    `/dashboard/${governmentExamsSlug}/current-affairs`
                }
            />

            <CurrentAffairsDateTabs
                dates={dates}
                selectedDate={
                    selectedDate
                }
                onSelect={
                    setSelectedDate
                }
            />

            <CurrentAffairsContent
                title={title}
                selectedDate={
                    selectedDate
                }
                content={content}
                filePath={
                    filePath
                }
                loading={
                    loading
                }
                error={
                    error
                }
            />
        </div>
    );
}