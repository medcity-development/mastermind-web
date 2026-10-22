"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Crown,
  FileQuestion,
  LoaderCircle,
} from "lucide-react";
import PremiumTestPurchaseModal from "@/components/mock-tests/PremiumTestPurchaseModal";

export default function StudyPlanMockTests({
  mockTestId,
  topicId,
  cid = 1,
  governmentExamsSlug,
  onStartTest,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (!topicId && !mockTestId) {
      return;
    }

    const controller = new AbortController();

    async function loadTest() {
      setLoading(true);
      setError("");
      setTest(null);

      try {
        const params = new URLSearchParams({
          cid: String(cid),
        });
        if (topicId) params.set("topicId", String(topicId));
        if (mockTestId) params.set("mockTestId", String(mockTestId));

        const response = await fetch(
          `/api/studyplan-topic-test?${params}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(
            result?.message || "Unable to load the Study Plan mock test."
          );
        }

        if (!controller.signal.aborted) {
          setTest(result.test || null);
        }
      } catch (loadError) {
        if (
          loadError?.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(
            loadError?.message ||
              "Unable to load the Study Plan mock test."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTest();
    return () => controller.abort();
  }, [cid, mockTestId, topicId]);

  function handleStart() {
    if (!test) return;

    if (String(test.access).toLowerCase() === "paid") {
      setShowPurchaseModal(true);
      return;
    }

    if (onStartTest) {
      onStartTest(test);
      return;
    }

    if (!governmentExamsSlug) {
      setError("Unable to open this mock test from the current page.");
      return;
    }

    const query = new URLSearchParams({
      type: "studyplan",
      title: test.exam_name,
      cid: String(cid),
    });

    router.push(
      `/dashboard/${governmentExamsSlug}/mock-tests/${test.id}?${query}`
    );
  }

  function handlePurchaseConfirmation() {
    if (!pathname) {
      setError("Unable to open available plans from the current page.");
      setShowPurchaseModal(false);
      return;
    }

    setShowPurchaseModal(false);
    router.push(`/dashboard/${governmentExamsSlug}?showPackages=1`);
  }

  if (!topicId && !mockTestId) {
    return (
      <section className="min-h-40 rounded-[24px] border border-amber-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,58,110,0.05)] sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
          Study Plan Practice
        </p>
        <h2 className="mt-2 text-xl font-black text-[#071f55]">
          Available Mock Test
        </h2>
        <p className="mt-5 text-sm text-slate-500">
          No mock test is currently linked to this topic.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-40 items-center justify-center gap-3 rounded-[24px] border border-amber-100 bg-white p-8">
        <LoaderCircle size={20} className="animate-spin text-amber-600" />
        <span className="text-sm text-slate-500">
          Loading Study Plan mock test...
        </span>
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="min-h-40 rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        <p className="font-black text-[#071f55]">Practice Mock Test</p>
        <p className="mt-3">{error}</p>
      </section>
    );
  }

  if (!test) {
    return (
      <section className="min-h-40 rounded-[24px] border border-amber-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,58,110,0.05)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <FileQuestion size={22} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Study Plan Practice
            </p>
            <h2 className="text-xl font-black text-[#071f55]">
              Available Mock Test
            </h2>
          </div>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          No mock test is currently linked to this topic.
        </p>
      </section>
    );
  }

  return (
    <>
    <section className="h-full min-w-0 rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_10px_35px_rgba(15,58,110,0.05)] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <FileQuestion size={22} />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
            Study Plan Practice
          </p>
          <h2 className="text-xl font-black text-[#071f55]">
            Available Mock Test
          </h2>
        </div>
      </div>

      <article className="mt-5 rounded-2xl border border-amber-100 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black text-[#071f55]">
            {test.exam_name || "Study Plan Test"}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-2 text-[10px] font-bold text-amber-800">
            <Crown size={13} />
            {test.access === "free" ? "Free" : "Premium"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <FileQuestion size={14} />
            {test.total_questions} questions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {test.total_minutes} minutes
          </span>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-xs font-black text-white transition hover:brightness-110"
        >
          Start Mock Test
          <ArrowRight size={15} />
        </button>
      </article>
    </section>
    <PremiumTestPurchaseModal
      open={showPurchaseModal}
      testName={test.exam_name}
      onClose={() => setShowPurchaseModal(false)}
      onConfirm={handlePurchaseConfirmation}
    />
    </>
  );
}
