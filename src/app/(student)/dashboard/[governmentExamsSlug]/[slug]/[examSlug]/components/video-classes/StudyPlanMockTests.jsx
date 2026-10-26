"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Clock3,
  Crown,
  FileQuestion,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  usePackageAccess,
} from "@/components/packages/PackageAccessContext";

import PremiumTestPurchaseModal from "@/components/mock-tests/PremiumTestPurchaseModal";

function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

function isFreeTest(access) {
  return String(access ?? "")
    .trim()
    .toLowerCase() === "free";
}

export default function StudyPlanMockTests({
  mockTestId,
  topicId,
  cid = 1,
  governmentExamsSlug,
  onStartTest,
}) {
  const packageAccess = usePackageAccess();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] =
    useState(false);

  const hasTopicId = hasValue(topicId);
  const hasMockTestId = hasValue(mockTestId);

  const hasLinkedTest = hasTopicId || hasMockTestId;

  useEffect(() => {
    if (!hasLinkedTest) {
      setLoading(false);
      setTest(null);
      setError("");
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

        if (hasTopicId) {
          params.set("topicId", String(topicId));
        }

        if (hasMockTestId) {
          params.set("mockTestId", String(mockTestId));
        }

        const response = await fetch(
          `/api/studyplan-topic-test?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || result?.status !== true) {
          throw new Error(
            result?.message ||
              "Unable to load the Study Plan mock test."
          );
        }

        if (!controller.signal.aborted) {
          setTest(result?.test ?? null);
        }
      } catch (err) {
        if (
          err?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        setError(
          err?.message ||
            "Unable to load the Study Plan mock test."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTest();

    return () => controller.abort();
  }, [
    cid,
    topicId,
    mockTestId,
    hasTopicId,
    hasMockTestId,
    hasLinkedTest,
    retryCount,
  ]);

  const free = isFreeTest(test?.access);
  const hasAccess = free || packageAccess === true;

  const accessLabel = free
    ? "Free"
    : packageAccess === true
      ? "Included in your plan"
      : "Premium";

  function handleStart() {
    if (!test) return;

    if (!hasAccess) {
      setShowPurchaseModal(true);
      return;
    }

    if (typeof onStartTest === "function") {
      onStartTest(test);
      return;
    }

    if (!governmentExamsSlug || !hasValue(test?.id)) {
      setError(
        "Unable to open this Study Plan test. Test information is missing."
      );
      return;
    }

    const query = new URLSearchParams({
      type: "studyplan",
      title: String(
        test?.exam_name || "Study Plan Test"
      ),
      cid: String(cid),
    });

    router.push(
      `/dashboard/${governmentExamsSlug}/mock-tests/${encodeURIComponent(
        String(test.id)
      )}?${query.toString()}`
    );
  }

  function handlePurchaseConfirmation() {
    setShowPurchaseModal(false);

    if (!governmentExamsSlug) {
      setError("Unable to open available packages.");
      return;
    }

    router.push(
      `/dashboard/${governmentExamsSlug}?showPackages=1`
    );
  }

  const containerClass = hasAccess
    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50"
    : "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50";

  const iconClass = hasAccess
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";

  if (!hasLinkedTest) {
    return (
      <section className="rounded-[24px] border border-amber-100 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
          Study Plan Practice
        </p>

        <h2 className="mt-2 text-xl font-black text-[#071f55]">
          Available Mock Test
        </h2>

        <p className="mt-4 text-sm text-slate-500">
          No mock test is currently linked to this topic.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-40 items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white p-8">
        <LoaderCircle
          size={20}
          className="animate-spin text-amber-600"
        />

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
        className="rounded-[24px] border border-red-200 bg-red-50 p-6"
      >
        <h2 className="font-bold text-red-700">
          Unable to load mock test
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setRetryCount((value) => value + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </section>
    );
  }

  if (!test) {
    return (
      <section className="rounded-[24px] border border-amber-100 bg-white p-6">
        <h2 className="font-black text-[#071f55]">
          Available Mock Test
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          No mock test is currently linked to this topic.
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        className={`h-full min-w-0 rounded-[24px] border p-5 shadow-[0_10px_35px_rgba(15,58,110,0.05)] sm:p-7 ${containerClass}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`rounded-2xl p-3 ${iconClass}`}
          >
            <FileQuestion size={22} />
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Study Plan Practice
            </p>

            <h2 className="text-xl font-black text-[#071f55]">
              Available Mock Test
            </h2>
          </div>
        </div>

        <article className="mt-5 rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-black text-[#071f55]">
              {test?.exam_name || "Study Plan Test"}
            </h3>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold ${
                hasAccess
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <Crown size={13} />
              {accessLabel}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <FileQuestion size={14} />
              {test?.total_questions ?? "—"} questions
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {test?.total_minutes ?? "—"} minutes
            </span>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-white transition hover:brightness-110 ${
              hasAccess
                ? "bg-gradient-to-r from-emerald-500 to-green-500"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
          >
            {hasAccess ? "Start Mock Test" : "Unlock Mock Test"}
            <ArrowRight size={15} />
          </button>
        </article>
      </section>

      <PremiumTestPurchaseModal
        open={showPurchaseModal}
        testName={test?.exam_name || "Study Plan Test"}
        onClose={() => setShowPurchaseModal(false)}
        onConfirm={handlePurchaseConfirmation}
      />
    </>
  );
}