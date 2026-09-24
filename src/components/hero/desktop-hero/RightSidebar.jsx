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
          bg-white
          shadow-[0_18px_50px_rgba(15,58,110,0.10)]

          lg:flex
          lg:flex-col
        "
      >
        {/* ================================================
            PREMIUM BACKGROUND
        ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-[#fbfdff]
            via-white
            to-[#f7faff]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]
            [background-size:26px_26px]
          "
        />

        {/* TOP GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-14
            -top-14
            h-44
            w-44
            rounded-full
            bg-[#00b5e8]/10
            blur-[60px]
          "
        />

        {/* BOTTOM GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-16
            -left-12
            h-44
            w-44
            rounded-full
            bg-[#7c3aed]/10
            blur-[65px]
          "
        />

        {/* ================================================
            HEADER
        ================================================ */}

        <div
          className="
            relative
            z-10
            shrink-0
            overflow-hidden
            bg-gradient-to-br
            from-[#f7fbff]
            via-[#eef7ff]
            to-[#f5f1ff]
            px-4
            py-3.5
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-10
              -top-10
              h-28
              w-28
              rounded-full
              bg-[#00b5e8]/10
              blur-[40px]
            "
          />

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
            {/* HEADER TEXT */}

            <div className="min-w-0">
              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#cfe5f8]
                  bg-white/80
                  px-2.5
                  py-1
                  shadow-sm
                  backdrop-blur
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
                    tracking-[0.16em]
                    text-[#017dc0]
                  "
                >
                  Quick Access
                </span>
              </div>

              <h2
                className="
                  mt-2
                  text-[18px]
                  font-black
                  leading-tight
                  tracking-[-0.035em]
                  text-[#071f55]
                "
              >
                Learning Hub
              </h2>

              <p
                className="
                  mt-1
                  max-w-[180px]
                  text-[9px]
                  font-medium
                  leading-4
                  text-slate-500
                "
              >
                Everything you need
                for smarter preparation
              </p>
            </div>

            {/* HEADER ICON */}

            <div
              className="
                relative
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-[15px]
                bg-gradient-to-br
                from-[#00b5e8]
                via-[#017dc0]
                to-[#6d4ce8]
                text-white
                shadow-[0_10px_24px_rgba(22,79,165,0.22)]
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute
                  inset-[4px]
                  rounded-[12px]
                  border
                  border-white/20
                "
              />

              <GraduationCap
                size={21}
                strokeWidth={1.9}
              />
            </div>
          </div>
        </div>

        {/* ================================================
            SCROLLABLE CONTENT
        ================================================ */}

        <div
          className="
            relative
            z-10
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-3
            pb-3
            pt-3
           [scrollbar-width:thin]
           [scrollbar-color:#9fdcff_#f3f9ff]
          "
        >
          {/* ITEMS */}

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

          {/* ================================================
              EXPLORE MORE
          ================================================ */}

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
                group
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[13px]
                border
                border-[#d5e5f3]
                bg-gradient-to-r
                from-white
                to-[#f6faff]
                px-4
                py-2.5
                text-[10px]
                font-black
                text-[#164fa5]
                shadow-[0_5px_16px_rgba(15,58,110,0.05)]
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:border-[#bfd8ed]
                hover:bg-[#f4f9ff]
                hover:shadow-[0_8px_20px_rgba(15,58,110,0.08)]
              "
            >
              <span>
                {expanded
                  ? "Show Less"
                  : "Explore More"}
              </span>

              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-[#eef6ff]
                  transition-transform
                  duration-300

                  group-hover:bg-[#e4f1ff]
                "
              >
                {expanded ? (
                  <ChevronUp
                    size={12}
                  />
                ) : (
                  <ChevronDown
                    size={12}
                  />
                )}
              </span>
            </button>
          )}

          {/* ================================================
              STUDY MATERIALS
          ================================================ */}

          <div
            className="
              mt-3
              border-t
              border-[#e4edf6]
              pt-3
            "
          >
            <StudyMaterialsLauncher />
          </div>

          <div className="h-1" />
        </div>

        {/* ================================================
            BOTTOM FADE
        ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            z-20
            h-5
            bg-gradient-to-t
            from-white/90
            to-transparent
          "
        />
      </aside>

      {/* ================================================
          MAIN COURSE SELECTOR
      ================================================ */}

      <MainCoursesModal
        open={Boolean(
          selectedItem
        )}
        destinationPath={
          selectedItem?.path ??
          ""
        }
        onClose={() =>
          setSelectedItem(
            null
          )
        }
      />
    </>
  );
}