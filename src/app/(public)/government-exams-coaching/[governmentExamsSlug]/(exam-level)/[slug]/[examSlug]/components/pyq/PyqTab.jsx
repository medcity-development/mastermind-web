// [examSlug]/components/pyq/PyqTab.jsx

"use client";

import {
  useEffect,
  useState,
} from "react";

import PyqHeader from "./PyqHeader";
import PyqLoading from "./PyqLoading";
import PyqEmpty from "./PyqEmpty";
import LevelPyqList from "./LevelPyqList";

export default function PyqTab({
  cid = 1,
  uid = 0,
  subId,
}) {
  const [exams, setExams] =
    useState([]);

  const [
    nextOffset,
    setNextOffset,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const selectedLevel =
    subId !== undefined &&
    subId !== null &&
    subId !== ""
      ? Number(subId)
      : null;

  useEffect(() => {
    if (
      selectedLevel === null ||
      Number.isNaN(selectedLevel)
    ) {
      setExams([]);
      setNextOffset(null);
      setLoading(false);
      setError(
        "Selected level is missing."
      );

      return;
    }

    const controller =
      new AbortController();

    async function loadInitialPyq() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            uid: String(uid),
            cid: String(cid),
            offset: "0",
            type: "pqp",

            // selected level only
            filter: String(
              selectedLevel
            ),
          });

        console.log(
          "PYQ LEVEL REQUEST:",
          {
            uid,
            cid,
            subId,
            filter:
              selectedLevel,
          }
        );

        const response =
          await fetch(
            `/api/previous-questions?${params.toString()}`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        const text =
          await response.text();

        let result = {};

        try {
          result = text
            ? JSON.parse(text)
            : {};
        } catch {
          console.error(
            "Invalid PYQ response:",
            text
          );

          throw new Error(
            "PYQ API returned invalid JSON."
          );
        }

        console.log(
          "PYQ LEVEL RESPONSE:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load previous questions."
          );
        }

        const data =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        setExams(data);

        setNextOffset(
          result?.nextOffset ??
            result?.nextoffset ??
            null
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "PYQ tab:",
          error
        );

        setExams([]);
        setNextOffset(null);

        setError(
          error?.message ||
            "Unable to load previous questions."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadInitialPyq();

    return () => {
      controller.abort();
    };
  }, [
    cid,
    uid,
    selectedLevel,
    subId,
  ]);

  if (loading) {
    return <PyqLoading />;
  }

  if (error) {
    return (
      <section
        className="
          rounded-[24px]
          border
          border-red-100
          bg-white
          p-5
          sm:p-6
        "
      >
        <PyqHeader />

        <div
          className="
            mt-6
            rounded-[18px]
            border
            border-red-100
            bg-red-50
            px-5
            py-10
            text-center
          "
        >
          <p
            className="
              text-[12px]
              font-bold
              text-red-600
            "
          >
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!exams.length) {
    return (
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          sm:p-6
        "
      >
        <PyqHeader />
        <PyqEmpty />
      </section>
    );
  }

  return (
    <section
      className="
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_12px_35px_rgba(22,79,165,0.05)]
        sm:p-6
      "
    >
      <PyqHeader
        count={exams.length}
      />

      <LevelPyqList
        initialExams={exams}
        initialNextOffset={
          nextOffset
        }
        uid={uid}
        cid={cid}
        levelFilter={
          selectedLevel
        }
      />
    </section>
  );
}