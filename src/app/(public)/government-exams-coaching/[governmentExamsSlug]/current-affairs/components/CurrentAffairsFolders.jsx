"use client";

import {
  useMemo,
  useState,
} from "react";

import CurrentAffairsStats from "./CurrentAffairsStats";
import CurrentAffairsToolbar from "./CurrentAffairsToolbar";
import CurrentAffairsFolderCard from "./CurrentAffairsFolderCard";
import CurrentAffairsPagination from "./CurrentAffairsPagination";

const ITEMS_PER_PAGE =
  12;

const MONTH_ORDER = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export default function CurrentAffairsFolders({
  months = [],
  years = [],
}) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedYear,
    setSelectedYear,
  ] = useState("all");

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    "latest"
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =====================================================
      AVAILABLE YEARS

      Use server-provided years if available.
      Otherwise derive from months.
  ===================================================== */

  const availableYears =
    useMemo(() => {
      if (
        Array.isArray(
          years
        ) &&
        years.length > 0
      ) {
        return [
          ...new Set(
            years
              .map(
                (year) =>
                  typeof year ===
                  "object"
                    ? Number(
                        year?.year
                      )
                    : Number(
                        year
                      )
              )
              .filter(
                Boolean
              )
          ),
        ].sort(
          (a, b) =>
            b - a
        );
      }

      return [
        ...new Set(
          months
            .map(
              (item) =>
                Number(
                  item?.year
                )
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (a, b) =>
          b - a
      );
    }, [
      months,
      years,
    ]);

  /* =====================================================
      FILTER + SORT
  ===================================================== */

  const filteredMonths =
    useMemo(() => {
      let result =
        [...months];

      /* YEAR FILTER */

      if (
        selectedYear !==
        "all"
      ) {
        result =
          result.filter(
            (item) =>
              String(
                item?.year
              ) ===
              String(
                selectedYear
              )
          );
      }

      /* SEARCH */

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (item) => {
              const label =
                `${item?.month ?? ""} ${item?.year ?? ""}`
                  .toLowerCase();

              return label.includes(
                query
              );
            }
          );
      }

      /* SORT */

      result.sort(
        (a, b) => {
          const aYear =
            Number(
              a?.year
            ) || 0;

          const bYear =
            Number(
              b?.year
            ) || 0;

          const aMonth =
            Number(
              a?.monthorder
            ) ||
            MONTH_ORDER[
              String(
                a?.month ??
                  ""
              ).toLowerCase()
            ] ||
            0;

          const bMonth =
            Number(
              b?.monthorder
            ) ||
            MONTH_ORDER[
              String(
                b?.month ??
                  ""
              ).toLowerCase()
            ] ||
            0;

          const comparison =
            bYear -
              aYear ||
            bMonth -
              aMonth;

          return sortOrder ===
            "latest"
            ? comparison
            : -comparison;
        }
      );

      return result;
    }, [
      months,
      selectedYear,
      search,
      sortOrder,
    ]);

  /* =====================================================
      PAGINATION
  ===================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredMonths.length /
          ITEMS_PER_PAGE
      )
    );

  const safePage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safePage - 1) *
    ITEMS_PER_PAGE;

  const visibleMonths =
    filteredMonths.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  /* =====================================================
      HANDLERS
  ===================================================== */

  function handleSearch(
    value
  ) {
    setSearch(value);

    setCurrentPage(1);
  }

  function handleYearChange(
    value
  ) {
    setSelectedYear(
      value
    );

    setCurrentPage(1);
  }

  function handleSortChange(
    value
  ) {
    setSortOrder(
      value
    );

    setCurrentPage(1);
  }

  return (
    <section className="mt-4">
      {/* MOBILE / TABLET STATS */}

      <CurrentAffairsStats
        totalMonths={
          months.length
        }
      />

      {/* TOOLBAR */}

      <CurrentAffairsToolbar
        search={search}
        onSearchChange={
          handleSearch
        }
        years={
          availableYears
        }
        selectedYear={
          selectedYear
        }
        onYearChange={
          handleYearChange
        }
        sortOrder={
          sortOrder
        }
        onSortChange={
          handleSortChange
        }
        totalMonths={
          months.length
        }
      />

      {/* FOLDERS */}

      {visibleMonths.length >
      0 ? (
        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {visibleMonths.map(
            (
              item,
              index
            ) => (
              <CurrentAffairsFolderCard
                key={
                  item?.id ??
                  `${item?.month}-${item?.year}`
                }
                item={item}
                index={
                  startIndex +
                  index
                }
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            mt-5
            rounded-[22px]
            border
            border-[#dbe8f7]
            bg-white
            px-5
            py-14
            text-center
            shadow-sm
          "
        >
          <p
            className="
              text-sm
              font-bold
              text-[#102c5c]
            "
          >
            No current affairs
            folders found.
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Try another year or
            search term.
          </p>
        </div>
      )}

      {/* PAGINATION */}

      <CurrentAffairsPagination
        currentPage={
          safePage
        }
        totalPages={
          totalPages
        }
        onPrevious={() =>
          setCurrentPage(
            (previous) =>
              Math.max(
                1,
                previous - 1
              )
          )
        }
        onNext={() =>
          setCurrentPage(
            (previous) =>
              Math.min(
                totalPages,
                previous + 1
              )
          )
        }
      />
    </section>
  );
}