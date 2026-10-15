"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  createSlug,
} from "@/lib/pscSlug";

import MockTestHeader from "./MockTestHeader";
import MockTestInstructions from "./MockTestInstructions";
import MockStartButton from "./MockStartButton";

export default function MockTestDetails({
  examSlug,
  selectedExamId = "",
  uid,
  cid,
  examTitle = "",
  examName = "Kerala PSC",
  governmentExamsSlug,
}) {
  const [resolvedExamId, setResolvedExamId] =
    useState(selectedExamId || (/^\d+$/.test(examSlug) ? examSlug : ""));
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

        let examId =
          selectedExamId ||
          (/^\d+$/.test(examSlug) ? examSlug : "");
        if (!examId) {
          let offset = 0;
          const visitedOffsets = new Set();
          while (!examId) {
            if (visitedOffsets.has(offset)) {
              throw new Error("Mock test list pagination did not advance.");
            }
            visitedOffsets.add(offset);
            const listParams = new URLSearchParams({
              cid: String(cid),
              uid: String(uid),
              offset: String(offset),
              filter: "0",
            });
            const listResponse = await fetch(
              `/api/mock-tests/list?${listParams.toString()}`,
              {
                cache: "no-store",
                signal: controller.signal,
              }
            );
            const listResult = await listResponse.json();
            if (!listResponse.ok) {
              throw new Error(listResult?.message || "Unable to find this mock test.");
            }

            const match = (Array.isArray(listResult?.data) ? listResult.data : [])
              .find((item) => createSlug(item?.exam_name) === examSlug);
            if (match?.id) {
              examId = String(match.id);
              setResolvedExamId(examId);
              break;
            }

            const nextOffset = listResult?.nextoffset ?? listResult?.nextOffset;
            if (nextOffset === null || nextOffset === undefined || nextOffset === "") {
              break;
            }
            const parsedOffset = Number(nextOffset);
            if (!Number.isFinite(parsedOffset) || parsedOffset < 0) {
              throw new Error("Mock test list returned an invalid next page.");
            }
            offset = parsedOffset;
          }
        }

        if (!examId) {
          throw new Error("This mock test could not be found.");
        }

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

        const rawInstructions =
          result?.instructions ??
          result?.instruction ??
          result?.data?.instructions ??
          result?.data;
        const instructionData =
          Array.isArray(rawInstructions)
            ? rawInstructions
            : typeof rawInstructions === "string" && rawInstructions.trim()
              ? [{ instructions: rawInstructions }]
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
    examSlug,
    selectedExamId,
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
      resolvedExamId,

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
        examName={
          examName
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
          resolvedExamId
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
        governmentExamsSlug={
          governmentExamsSlug
        }
      />
    </>
  );
}