"use client";

import {
  useEffect,
  useState,
} from "react";

import MockTestHeader from "./MockTestHeader";
import MockTestInstructions from "./MockTestInstructions";
import MockStartButton from "./MockStartButton";

export default function MockTestDetails({
  examId,
  uid,
  cid,
  examTitle = "",
}) {
  const [exam, setExam] =
    useState(null);

  const [
    instructions,
    setInstructions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load mock test."
          );
        }

        const examData =
          Array.isArray(
            result?.exam
          )
            ? result.exam[0] ??
              null
            : result?.exam ??
              null;

        const instructionData =
          Array.isArray(
            result?.data
          )
            ? result.data
            : [];

        setExam(
          examData
        );

        setInstructions(
          instructionData
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Mock test details:",
          error
        );

        setError(
          error?.message ||
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

    loadDetails();

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
          mt-20
          space-y-5
        "
      >
        <div
          className="
            h-[250px]
            animate-pulse
            rounded-[28px]
            bg-slate-200
          "
        />

        <div
          className="
            h-[200px]
            animate-pulse
            rounded-[24px]
            bg-white
          "
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          mt-20
          rounded-[24px]
          border
          border-red-200
          bg-red-50
          px-6
          py-12
          text-center
        "
      >
        <p
          className="
            text-[13px]
            font-bold
            text-red-600
          "
        >
          {error}
        </p>
      </div>
    );
  }

  const completeExam = {
    ...(exam || {}),

    id:
      exam?.id ??
      examId,

    exam_name:
      exam?.exam_name ||
      examTitle ||
      "",
  };

  return (
    <>
      <MockTestHeader
        exam={
          completeExam
        }
      />

      <div className="mt-6">
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
        uid={
          uid
        }
        cid={
          cid
        }
        title={
          completeExam
            ?.exam_name
        }
      />
    </>
  );
}