"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  Clock3,
  Crown,
  FileQuestion,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import PremiumTestPurchaseModal from "@/components/mock-tests/PremiumTestPurchaseModal";
import { continueToPremiumPackages } from "@/lib/premiumPackagesRedirect";

export default function StudyPlanMockTests({
  cid = 1,
  uid = 0,
  topicId,
  mockTestId,
  onLoginRequired,
  onStartTest,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const authenticated = Number(uid) > 0;

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

        if (!response.ok || result.status === false) {
          throw new Error(
            result.message ||
            "Unable to load mock test."
          );
        }

        if (!controller.signal.aborted) {
          setTest(result.test || null);
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTest();

    return () => controller.abort();
  }, [cid, topicId, mockTestId]);

  function handleStart() {
    if (!test) return;

    if (String(test.access).toLowerCase() === "paid") {
      setShowPurchaseModal(true);
      return;
    }

    if (!authenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        router.push(
          `/login?redirect=${encodeURIComponent(
            pathname || "/"
          )}`
        );
      }

      return;
    }

    onStartTest?.(test);
  }
  function handlePurchaseConfirmation() {
    if (!governmentExamsSlug) {
      setError("Unable to open login from the current page.");
      setShowPurchaseModal(false);
      return;
    }

    setShowPurchaseModal(false);
    continueToPremiumPackages(router, pathname).catch((purchaseError) => {
      setError(
        purchaseError?.message ||
          "Unable to open available plans."
      );
    });
  }

  if (loading && (topicId || mockTestId)) {
    return (
      <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-white p-8">
        <LoaderCircle
          size={20}
          className="animate-spin text-blue-600"
        />
        <span className="text-sm text-slate-500">
          Loading Study Plan mock test...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        {error}
      </div>
    );
  }

  if (!test) {
    return (
      <section className="h-full min-w-0 rounded-[26px] border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <FileQuestion size={23} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Study Plan Practice
            </p>
            <h2 className="text-xl font-black text-[#071f55]">
              Practice Mock Test
            </h2>
          </div>
        </div>
        <p role="alert" className="mt-5 text-sm text-amber-900">
          {mockTestId
            ? "This linked mock test is temporarily unavailable. Please try again later."
            : "No mock test is currently linked to this topic."}
        </p>
      </section>
    );
  }

  const paid = test.access === "paid";

  return (
    <>
    <section className="h-full min-w-0 rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <FileQuestion size={23} />
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

      <article className="mt-6 rounded-[20px] border border-amber-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-700">
            STUDY PLAN
          </span>

          {paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 text-[10px] font-bold text-amber-800">
              <Crown size={14} />
              Premium
            </span>
          )}
        </div>

        <h3 className="mt-5 text-lg font-black text-[#071f55]">
          {test.exam_name}
        </h3>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <FileQuestion size={15} />
            {test.total_questions} Questions
          </span>

          <span className="inline-flex items-center gap-2">
            <Clock3 size={15} />
            {test.total_minutes} Minutes
          </span>
        </div>

        {paid && (
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-700">
            <LockKeyhole size={14} />
            Purchase required to start this test
          </p>
        )}

        <button
          type="button"
          disabled={
            authenticated &&
            !paid &&
            !onStartTest
          }
          onClick={handleStart}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 px-5 py-3 text-xs font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paid
            ? "OK"
            : !authenticated
              ? "Login to Continue"
              : "Continue to Mock Test"}

          <ArrowRight size={16} />
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