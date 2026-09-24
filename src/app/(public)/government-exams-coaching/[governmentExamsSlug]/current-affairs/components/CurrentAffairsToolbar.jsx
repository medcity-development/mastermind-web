import {
  CalendarDays,
  FileText,
  Search,
  Users,
} from "lucide-react";

export default function CurrentAffairsToolbar({
  search,
  onSearchChange,
  years = [],
  selectedYear,
  onYearChange,
  sortOrder,
  onSortChange,
  totalMonths = 0,
}) {
  return (
    <div
      className="
        mt-4
        flex
        flex-col
        gap-3
        rounded-[22px]
        border
        border-[#dbeafe]
        bg-white
        p-3
        shadow-[0_10px_30px_rgba(22,79,165,0.07)]
        xl:flex-row
        xl:items-center
      "
    >
      {/* =========================================
          COLORFUL DESKTOP STATS
      ========================================= */}

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-2
          xl:flex
        "
      >
        <StatCard
          icon={
            CalendarDays
          }
          value={`${totalMonths}+`}
          label="Months Available"
          cardBg="
            from-[#e8f7ff]
            via-[#f5fbff]
            to-[#dcf3ff]
          "
          borderColor="
            border-[#00a8e8]/20
          "
          iconBg="
            from-[#087bea]
            via-[#1597ff]
            to-[#00b5e8]
          "
          textColor="
            text-[#0b65c2]
          "
          glowColor="
            bg-[#00b5e8]/20
          "
          dotColor="
            bg-[#00b5e8]
          "
        />

        <StatCard
          icon={
            FileText
          }
          value="500+"
          label="Daily Updates"
          cardBg="
            from-[#fff0f7]
            via-[#fff8fb]
            to-[#ffe3ef]
          "
          borderColor="
            border-[#e83e8c]/20
          "
          iconBg="
            from-[#ff5ca4]
            via-[#e83e8c]
            to-[#c026d3]
          "
          textColor="
            text-[#d62c7c]
          "
          glowColor="
            bg-[#e83e8c]/20
          "
          dotColor="
            bg-[#e83e8c]
          "
        />

        <StatCard
          icon={Users}
          value="100K+"
          label="Aspirants Learning"
          cardBg="
            from-[#f5f0ff]
            via-[#fbf9ff]
            to-[#ebe3ff]
          "
          borderColor="
            border-[#7c3aed]/20
          "
          iconBg="
            from-[#9b6cff]
            via-[#7c3aed]
            to-[#5b21b6]
          "
          textColor="
            text-[#6d28d9]
          "
          glowColor="
            bg-[#7c3aed]/20
          "
          dotColor="
            bg-[#7c3aed]
          "
        />
      </div>

      {/* =========================================
          SEARCH
      ========================================= */}

      <div
        className="
          relative
          min-w-0
          flex-1
        "
      >
        <Search
          size={16}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-[#60789d]
          "
        />

        <input
          type="text"
          value={search}
          onChange={(
            event
          ) =>
            onSearchChange(
              event.target
                .value
            )
          }
          placeholder="Search months (e.g. April 2025)..."
          className="
            h-12
            w-full
            rounded-[14px]
            border
            border-[#dce8f7]
            bg-gradient-to-r
            from-[#fbfdff]
            via-white
            to-[#f8fbff]
            pl-11
            pr-4
            text-xs
            font-medium
            text-[#102c5c]
            outline-none
            transition-all
            duration-300
            placeholder:text-slate-400
            focus:border-[#087bea]/40
            focus:ring-4
            focus:ring-[#087bea]/5
          "
        />
      </div>

      {/* =========================================
          YEAR
      ========================================= */}

      <div
        className="
          relative
          shrink-0
        "
      >
        <select
          value={
            selectedYear
          }
          onChange={(
            event
          ) =>
            onYearChange(
              event.target
                .value
            )
          }
          className="
            h-12
            min-w-[150px]
            cursor-pointer
            appearance-none
            rounded-[14px]
            border
            border-[#9ddcff]/40
            bg-gradient-to-r
            from-[#eef9ff]
            to-[#e5f5ff]
            px-4
            pr-10
            text-xs
            font-bold
            text-[#0b65c2]
            outline-none
            transition-all
            duration-300
            hover:border-[#087bea]/35
            hover:shadow-[0_6px_16px_rgba(8,123,234,0.08)]
          "
        >
          <option value="all">
            All Years
          </option>

          {years.map(
            (year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            )
          )}
        </select>

        <span
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-[10px]
            text-[#087bea]
          "
        >
          ▼
        </span>
      </div>

      {/* =========================================
          SORT
      ========================================= */}

      <div
        className="
          relative
          shrink-0
        "
      >
        <select
          value={
            sortOrder
          }
          onChange={(
            event
          ) =>
            onSortChange(
              event.target
                .value
            )
          }
          className="
            h-12
            min-w-[150px]
            cursor-pointer
            appearance-none
            rounded-[14px]
            border
            border-[#c9b8ff]/40
            bg-gradient-to-r
            from-[#f8f5ff]
            to-[#f1ebff]
            px-4
            pr-10
            text-xs
            font-bold
            text-[#6d28d9]
            outline-none
            transition-all
            duration-300
            hover:border-[#7c3aed]/30
          "
        >
          <option value="latest">
            Latest First
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>

        <span
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-[10px]
            text-[#7c3aed]
          "
        >
          ▼
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  value,
  label,
  cardBg,
  borderColor,
  iconBg,
  textColor,
  glowColor,
  dotColor,
}) {
  return (
    <div
      className={`
        group
        relative
        flex
        min-w-[155px]
        items-center
        gap-3
        overflow-hidden
        rounded-[16px]
        border
        bg-gradient-to-br
        px-3
        py-2.5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
        ${cardBg}
        ${borderColor}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-5
          -top-5
          h-16
          w-16
          rounded-full
          blur-xl
          ${glowColor}
        `}
      />

      <span
        aria-hidden="true"
        className={`
          absolute
          right-3
          top-3
          h-2
          w-2
          rounded-full
          opacity-50
          ${dotColor}
        `}
      />

      <span
        className={`
          relative
          z-10
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          bg-gradient-to-br
          text-white
          shadow-[0_8px_18px_rgba(15,23,42,0.12)]
          transition-all
          duration-300
          group-hover:scale-105
          ${iconBg}
        `}
      >
        <Icon
          size={17}
          strokeWidth={
            2.3
          }
        />
      </span>

      <div
        className="
          relative
          z-10
          min-w-0
        "
      >
        <strong
          className={`
            block
            text-[14px]
            font-extrabold
            leading-none
            tracking-[-0.02em]
            ${textColor}
          `}
        >
          {value}
        </strong>

        <span
          className="
            mt-1
            block
            whitespace-nowrap
            text-[9px]
            font-semibold
            text-slate-500
          "
        >
          {label}
        </span>
      </div>
    </div>
  );
}