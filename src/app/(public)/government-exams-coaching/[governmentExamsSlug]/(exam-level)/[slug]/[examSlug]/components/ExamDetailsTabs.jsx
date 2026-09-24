"use client";

import {
  useState,
} from "react";

import {
  BookOpen,
  FileQuestion,
  PlayCircle,
  Target,
} from "lucide-react";

import VideoClassesTab from "./video-classes/VideoClassesTab";
import MockTestsTab from "./mock-tests/MockTestsTab";
import PyqTab from "./pyq/PyqTab";
import ScertTestsTab from "./scert-tests/ScertTestsTab";

const tabs = [
  {
    key: "video",
    label:
      "Video Classes",
    icon:
      PlayCircle,
  },
  {
    key: "mock",
    label:
      "Mock Tests",
    icon:
      Target,
  },
  {
    key: "pqp",
    label:
      "PYQ",
    icon:
      FileQuestion,
  },
  {
    key: "scert",
    label:
      "SCERT Exams",
    icon:
      BookOpen,
  },
];

export default function ExamDetailsTabs({
  cid = 1,
  uid = 0,
  examId,
  subId,
  exam,
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "video"
    );

  if (!examId) {
    return null;
  }

  return (
    <section
      className="
        mt-6
      "
    >
      {/* TAB BAR */}
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
          className="
            flex
            min-w-max
            gap-2
          "
        >
          {tabs.map(
            (tab) => {
              const Icon =
                tab.icon;

              const active =
                activeTab ===
                tab.key;

              return (
                <button
                  key={
                    tab.key
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.key
                    )
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-[14px]
                    px-4
                    py-3
                    text-[11px]
                    font-bold
                    transition-all
                    duration-200

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
                            text-slate-600
                            hover:bg-[#f3f8ff]
                            hover:text-[#075fc8]
                          `
                    }
                  `}
                >
                  <Icon
                    size={
                      16
                    }
                  />

                  {
                    tab.label
                  }
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
          mt-5
        "
      >
        {activeTab ===
          "video" && (
          <VideoClassesTab
            cid={
              cid
            }
            uid={
              uid
            }
            examId={
              examId
            }
            subId={
              subId
            }
            exam={
              exam
            }
          />
        )}

        {activeTab ===
          "mock" && (
          <MockTestsTab
            cid={
              cid
            }
            uid={
              uid
            }
            examId={
              examId
            }
            subId={
              subId
            }
            exam={
              exam
            }
          />
        )}

{activeTab === "pqp" && (
  <PyqTab
    cid={cid}
    uid={uid}
    subId={subId}
  />
)}

        {activeTab ===
          "scert" && (
          <ScertTestsTab
            cid={
              cid
            }
            uid={
              uid
            }
            subId={
              subId
            }
            examId={
              examId
            }
          />
        )}
      </div>
    </section>
  );
}