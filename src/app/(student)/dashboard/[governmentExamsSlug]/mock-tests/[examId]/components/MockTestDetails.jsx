"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
} from "lucide-react";

import MockTestHeader from "./MockTestHeader";
import MockTestInstructions from "./MockTestInstructions";
import MockStartButton from "./MockStartButton";

export default function MockTestDetails({
  examId,
  uid,
  cid,
  examName = "",
  shortName = "",
  governmentExamsSlug,
  examTitle = "",
}) {
  const [
    exam,
    setExam,
  ] = useState(null);

  const [
    instructions,
    setInstructions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadDetails() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            cid:
              String(cid),

            uid:
              String(uid),

            examid:
              String(examId),
          });

        const response =
          await fetch(
            `/api/mock-tests/details?${params.toString()}`,
            {
              cache:
                "no-store",

              signal:
                controller.signal,
            }
          );

        const raw =
          await response.text();

        let result;

        try {
          result =
            raw
              ? JSON.parse(raw)
              : {};
        } catch {
          throw new Error(
            "Mock test details API returned invalid JSON."
          );
        }

        if (
          !response.ok ||
          result?.status ===
          false
        ) {
          throw new Error(
            result?.message ||
            result?.msg ||
            "Unable to load mock test."
          );
        }

        const examData =
          Array.isArray(
            result?.exam
          )
            ? result.exam[0] ??
            null
            : result?.exam &&
              typeof result.exam ===
              "object"
              ? result.exam
              : null;

        const instructionData =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        if (!examData) {
          throw new Error(
            "Mock test details were not returned."
          );
        }

        setExam(
          examData
        );

        setInstructions(
          instructionData
        );
      } catch (
      loadError
      ) {
        if (
          loadError?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "MOCK TEST DETAILS:",
          loadError
        );

        setError(
          loadError?.message ||
          "Unable to load mock test."
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

    if (
      examId &&
      uid &&
      cid
    ) {
      loadDetails();
    }

    return () => {
      controller.abort();
    };
  }, [
    examId,
    uid,
    cid,
  ]);

  if (loading) {
    return (
      <div
        className="
          h-[300px]
          animate-pulse
          rounded-[26px]
          bg-slate-200
        "
      />
    );
  }

  if (error) {
    return (
      <div
        className="
          rounded-[24px]
          border
          border-red-200
          bg-red-50
          px-6
          py-12
          text-center
        "
      >
        <AlertCircle
          size={26}
          className="
            mx-auto
            text-red-500
          "
        />

        <p
          className="
            mt-3
            text-sm
            font-bold
            text-red-600
          "
        >
          {error}
        </p>
      </div>
    );
  }

  const resolvedExamTitle =
    String(
      exam?.exam_name ??
      exam?.examName ??
      exam?.exam_title ??
      exam?.examTitle ??
      exam?.title ??
      exam?.name ??
      examTitle ??
      ""
    ).trim();

  const completeExam = {
    ...(exam || {}),

    id:
      exam?.id ??
      examId,

    exam_name:
      resolvedExamTitle,
  };

  return (
    <>
      <MockTestHeader
        exam={
          completeExam
        }
        examName={
          examName
        }
        shortName={
          shortName
        }
      />

      <div
        className="
          mt-6
        "
      >
        <MockTestInstructions
          exam={
            completeExam
          }
          instructions={
            instructions
          }
        />
      </div>

      <MockStartButton
        examId={
          examId
        }
        governmentExamsSlug={
          governmentExamsSlug
        }
        examTitle={
          completeExam?.exam_name ||
          ""
        }
      />
    </>
  );
}