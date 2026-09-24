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

  useEffect(() => {
    if (
      !cid ||
      !selectedDate
    ) {
      return;
    }

    async function loadContent() {
      try {
        setLoading(true);

        const response =
          await fetch(
            `/api/current-affairs/data?cid=${cid}&date=${selectedDate}`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        setContent(
          Array.isArray(
            result?.data
          )
            ? result.data
            : []
        );

        setFilePath(
          result?.filePath ??
            ""
        );
      } catch (error) {
        console.error(
          error
        );

        setContent([]);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
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
        filePath={filePath}
        loading={loading}
      />
    </div>
  );
}