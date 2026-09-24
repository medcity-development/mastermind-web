"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import {
  exploreItems,
} from "./data";

import SidebarItem from "./SidebarItem";

import MainCoursesModal from "@/components/main-course-modal/MainCoursesModal";

import StudyMaterialsLauncher from "@/app/(public)/government-exams-coaching/[governmentExamsSlug]/study-materials/components/StudyMaterialsLauncher";

const INITIAL_VISIBLE_ITEMS = 5;

export default function RightSidebar() {
  const [
    selectedItem,
    setSelectedItem,
  ] = useState(null);

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const visibleItems =
    expanded
      ? exploreItems
      : exploreItems.slice(
          0,
          INITIAL_VISIBLE_ITEMS
        );

  const hasMore =
    exploreItems.length >
    INITIAL_VISIBLE_ITEMS;

  return (
    <>
      <aside
        className="
          relative
          hidden
          h-full
          min-h-0
          overflow-hidden
          rounded-[26px]
          border
          border-[#dce7f4]
          bg-gradient-to-b
          from-[#fbfdff]
          via-white
          to-[#f8fbff]
          shadow-[0_18px_45px_rgba(22,79,165,0.08)]
          lg:flex
          lg:flex-col
        "
      >
        {/* TOP GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-44
            w-44
            rounded-full
            bg-sky-200/20
            blur-3xl
          "
        />

        {/* BOTTOM GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-16
            h-44
            w-44
            rounded-full
            bg-violet-200/15
            blur-3xl
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            z-10
            shrink-0
            overflow-hidden
            border-b
            border-[#dce7f4]
            bg-gradient-to-br
            from-[#f8fbff]
            via-[#edf6ff]
            to-[#f5f0ff]
            px-4
            py-3
          "
        >
          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#cfe5f8]
                  bg-white/75
                  px-2
                  py-0.5
                "
              >
                <Sparkles
                  size={9}
                  className="text-[#017dc0]"
                />

                <span
                  className="
                    text-[7px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-[#017dc0]
                  "
                >
                  Quick Access
                </span>
              </div>

              <h2
                className="
                  mt-1.5
                  text-[17px]
                  font-black
                  tracking-[-0.03em]
                  text-[#071f55]
                "
              >
                Learning Hub
              </h2>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  font-medium
                  leading-4
                  text-slate-500
                "
              >
                Everything you need
                for preparation
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-[14px]
                bg-gradient-to-br
                from-[#00b5e8]
                via-[#017dc0]
                to-[#6d4ce8]
                text-white
              "
            >
              <GraduationCap
                size={20}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div
          className={`
            relative
            z-10
            min-h-0
            flex-1
            px-3
            pb-3
            pt-3

            ${
              expanded
                ? "overflow-y-auto"
                : "overflow-hidden"
            }
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-2
            "
          >
            {visibleItems.map(
              (
                item,
                index
              ) => (
                <SidebarItem
                  key={
                    item.title
                  }
                  {...item}
                  tone={
                    index % 5
                  }
                  position={
                    index + 1
                  }
                  onClick={() =>
                    setSelectedItem(
                      item
                    )
                  }
                />
              )
            )}
          </div>

          {/* EXPLORE MORE */}

          {hasMore && (
            <button
              type="button"
              onClick={() =>
                setExpanded(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              className="
                mt-2.5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[12px]
                border
                border-[#d8e8f5]
                bg-white/80
                px-4
                py-2
                text-[10px]
                font-bold
                text-[#164fa5]
                transition-all
                duration-300
                hover:bg-[#f4f9ff]
              "
            >
              <span>
                {expanded
                  ? "Show Less"
                  : "Explore More"}
              </span>

              {expanded ? (
                <ChevronUp
                  size={12}
                />
              ) : (
                <ChevronDown
                  size={12}
                />
              )}
            </button>
          )}

          {/* STUDY MATERIALS */}

          <div
            className="
              mt-3
              border-t
              border-[#e5edf5]
              pt-3
            "
          >
            <StudyMaterialsLauncher />
          </div>

          <div className="h-1" />
        </div>
      </aside>

      {/* MAIN COURSE SELECTOR */}

      <MainCoursesModal
        open={Boolean(
          selectedItem
        )}
        destinationPath={
          selectedItem?.path ??
          ""
        }
        onClose={() =>
          setSelectedItem(null)
        }
      />
    </>
  );
}