import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   CREATE PAGINATION URL
========================================================= */

function createPageHref(page) {
  return {
    pathname:
      "/government-exams-coaching/kerala-psc/topic-wise-exams",

    query: {
      page:
        String(page),
    },
  };
}

/* =========================================================
   VISIBLE PAGE NUMBERS
========================================================= */

function getVisiblePages(
  currentPage,
  totalPages
) {
  if (totalPages <= 5) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    );
  }

  if (currentPage <= 3) {
    return [
      1,
      2,
      3,
      4,
      5,
    ];
  }

  if (
    currentPage >=
    totalPages - 2
  ) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TopicWisePagination({
  currentPage = 1,
  totalPages = 1,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages =
    getVisiblePages(
      currentPage,
      totalPages
    );

  const hasPrevious =
    currentPage > 1;

  const hasNext =
    currentPage <
    totalPages;

  return (
    <nav
      aria-label="Topic pagination"
      className="
        mt-10
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
      "
    >
      {/* PREVIOUS */}

      {hasPrevious ? (
        <Link
          href={createPageHref(
            currentPage - 1
          )}
          scroll
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-[#dce8f7]
            bg-white
            px-4
            text-[11px]
            font-bold
            text-[#071f55]
            shadow-sm
            transition-all
            duration-200
            hover:border-[#075fc8]/30
            hover:bg-[#f2f8ff]
          "
        >
          <ChevronLeft
            size={16}
          />

          Previous
        </Link>
      ) : (
        <span
          className="
            inline-flex
            h-11
            cursor-not-allowed
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-slate-200
            bg-slate-100
            px-4
            text-[11px]
            font-bold
            text-slate-400
          "
        >
          <ChevronLeft
            size={16}
          />

          Previous
        </span>
      )}

      {/* FIRST PAGE */}

      {pages[0] > 1 ? (
        <>
          <PageButton
            page={1}
            currentPage={
              currentPage
            }
          />

          {pages[0] > 2 ? (
            <span
              className="
                px-1
                text-sm
                font-bold
                text-slate-400
              "
            >
              ...
            </span>
          ) : null}
        </>
      ) : null}

      {/* PAGE NUMBERS */}

      {pages.map(
        (page) => (
          <PageButton
            key={page}
            page={page}
            currentPage={
              currentPage
            }
          />
        )
      )}

      {/* LAST PAGE */}

      {pages[
        pages.length - 1
      ] < totalPages ? (
        <>
          {pages[
            pages.length - 1
          ] <
          totalPages - 1 ? (
            <span
              className="
                px-1
                text-sm
                font-bold
                text-slate-400
              "
            >
              ...
            </span>
          ) : null}

          <PageButton
            page={
              totalPages
            }
            currentPage={
              currentPage
            }
          />
        </>
      ) : null}

      {/* NEXT */}

      {hasNext ? (
        <Link
          href={createPageHref(
            currentPage + 1
          )}
          scroll
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-[#dce8f7]
            bg-white
            px-4
            text-[11px]
            font-bold
            text-[#071f55]
            shadow-sm
            transition-all
            duration-200
            hover:border-[#075fc8]/30
            hover:bg-[#f2f8ff]
          "
        >
          Next

          <ChevronRight
            size={16}
          />
        </Link>
      ) : (
        <span
          className="
            inline-flex
            h-11
            cursor-not-allowed
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-slate-200
            bg-slate-100
            px-4
            text-[11px]
            font-bold
            text-slate-400
          "
        >
          Next

          <ChevronRight
            size={16}
          />
        </span>
      )}
    </nav>
  );
}

/* =========================================================
   PAGE BUTTON
========================================================= */

function PageButton({
  page,
  currentPage,
}) {
  const active =
    Number(page) ===
    Number(currentPage);

  if (active) {
    return (
      <span
        aria-current="page"
        className="
          inline-flex
          h-11
          min-w-11
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-br
          from-[#071f55]
          via-[#075fc8]
          to-[#017dc0]
          px-3
          text-[12px]
          font-black
          text-white
          shadow-[0_8px_20px_rgba(7,95,200,0.22)]
        "
      >
        {page}
      </span>
    );
  }

  return (
    <Link
      href={createPageHref(
        page
      )}
      scroll
      className="
        inline-flex
        h-11
        min-w-11
        items-center
        justify-center
        rounded-xl
        border
        border-[#dce8f7]
        bg-white
        px-3
        text-[12px]
        font-bold
        text-slate-600
        shadow-sm
        transition-all
        duration-200
        hover:border-[#075fc8]/30
        hover:bg-[#f2f8ff]
        hover:text-[#075fc8]
      "
    >
      {page}
    </Link>
  );
}