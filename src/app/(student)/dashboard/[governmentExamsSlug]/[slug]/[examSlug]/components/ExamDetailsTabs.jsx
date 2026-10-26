
"use client";

import { useMemo, useState } from "react";

import {
  BookOpen,
  FileQuestion,
  PlayCircle,
  Target,
} from "lucide-react";

import { PackageAccessContext } from "@/components/packages/PackageAccessContext";

import VideoClassesTab from "./video-classes/VideoClassesTab";
import MockTestsTab from "./mock-tests/MockTestsTab";
import PyqTab from "./pyq/PyqTab";
import ScertTestsTab from "./scert-tests/ScertTestsTab";

/* =========================================================
   TAB CONFIGURATION
========================================================= */

const TABS = [
  {
    key: "video",
    label: "Video Classes",
    icon: PlayCircle,
  },
  {
    key: "mock",
    label: "Mock Tests",
    icon: Target,
  },
  {
    key: "pqp",
    label: "PYQ",
    icon: FileQuestion,
  },
  {
    key: "scert",
    label: "SCERT Exams",
    icon: BookOpen,
  },
];

/* =========================================================
   NORMALIZE ACCESS VALUE

   Supported:
   true, 1, "1", "true"

   Not supported:
   false, 0, "0", null, undefined
========================================================= */

function normalizePackageAccess(value) {
  if (value === true || value === 1) {
    return true;
  }

  if (typeof value === "string") {
    return ["1", "true"].includes(
      value.trim().toLowerCase()
    );
  }

  return false;
}

/* =========================================================
   TAB BUTTON
========================================================= */

function ExamTabButton({
  tab,
  active,
  onClick,
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      role="tab"
      id={`exam-tab-${tab.key}`}
      aria-selected={active}
      aria-controls={`exam-panel-${tab.key}`}
      onClick={onClick}
      className={`
        inline-flex
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-[14px]
        px-4
        py-3
        text-[11px]
        font-bold
        transition-all
        duration-200
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#075fc8]

        ${
          active
            ? `
              bg-gradient-to-r
              from-[#075fc8]
              to-[#7c3aed]
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.20)]
            `
            : `
              bg-transparent
              text-slate-600
              hover:bg-[#f3f8ff]
              hover:text-[#075fc8]
            `
        }
      `}
    >
      <Icon size={16} />

      <span>{tab.label}</span>
    </button>
  );
}

/* =========================================================
   EXAM DETAILS TABS
========================================================= */

export default function ExamDetailsTabs({
  cid = 1,
  uid = 0,
  examId,
  subId,
  exam,
  governmentExamsSlug,
}) {
  const [activeTab, setActiveTab] = useState("video");

  /* =======================================================
     PACKAGE ACCESS

     The parent page must supply a verified
     course/package-specific entitlement.

     Do not infer access from login status or
     a general premium_status flag.
  ======================================================= */

  const hasPackageAccess = useMemo(() => {
    return normalizePackageAccess(
      exam?.packageAccess
    );
  }, [exam?.packageAccess]);

  /* =======================================================
     VALIDATE EXAM ID
  ======================================================= */

  if (
    examId === null ||
    examId === undefined ||
    String(examId).trim() === ""
  ) {
    return null;
  }

  /* =======================================================
     RENDER ACTIVE TAB
  ======================================================= */

  function renderActiveTab() {
    switch (activeTab) {
      case "video":
        return (
          <VideoClassesTab
            cid={cid}
            uid={uid}
            examId={examId}
            subId={subId}
            governmentExamsSlug={governmentExamsSlug}
            exam={exam}
          />
        );

      case "mock":
        return (
          <MockTestsTab
            cid={cid}
            uid={uid}
            examId={examId}
            subId={subId}
            exam={exam}
          />
        );

      case "pqp":
        return (
          <PyqTab
            cid={cid}
            uid={uid}
            subId={subId}
            governmentExamsSlug={governmentExamsSlug}
          />
        );

      case "scert":
        return (
          <ScertTestsTab
            cid={cid}
            uid={uid}
            subId={subId}
            examId={examId}
            governmentExamsSlug={governmentExamsSlug}
          />
        );

      default:
        return null;
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <PackageAccessContext.Provider
      value={hasPackageAccess}
    >
      <section className="mt-6 w-full min-w-0">
        {/* TAB NAVIGATION */}

        <div
          className="
            overflow-x-auto
            rounded-[22px]
            border
            border-[#dce8f7]
            bg-white
            p-2
            shadow-[0_10px_30px_rgba(22,79,165,0.05)]
          "
        >
          <div
            role="tablist"
            aria-label="Exam preparation sections"
            className="
              flex
              min-w-max
              items-center
              gap-2
            "
          >
            {TABS.map((tab) => (
              <ExamTabButton
                key={tab.key}
                tab={tab}
                active={activeTab === tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                }}
              />
            ))}
          </div>
        </div>

        {/* ACTIVE TAB CONTENT */}

        <div
          id={`exam-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`exam-tab-${activeTab}`}
          className="
            mt-5
            min-w-0
            w-full
          "
        >
          {renderActiveTab()}
        </div>
      </section>
    </PackageAccessContext.Provider>
  );
}
