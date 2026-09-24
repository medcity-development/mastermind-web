import {
    CalendarDays,
  } from "lucide-react";
  
  export default function CurrentAffairsDateTabs({
    dates = [],
    selectedDate,
    onSelect,
  }) {
    if (!dates.length) {
      return (
        <div
          className="
            mt-5
            rounded-[20px]
            border
            border-slate-200
            bg-white
            p-6
            text-center
            text-sm
            text-slate-500
          "
        >
          No dates available for
          this month.
        </div>
      );
    }
  
    return (
      <section
        className="
          mt-5
          rounded-[22px]
          border
          border-[#dbe8f7]
          bg-white
          p-4
          shadow-[0_10px_28px_rgba(22,79,165,0.06)]
        "
      >
        <div
          className="
            mb-4
            flex
            items-center
            gap-2
          "
        >
          <CalendarDays
            size={17}
            className="
              text-[#087bea]
            "
          />
  
          <h2
            className="
              text-sm
              font-bold
              text-[#102c5c]
            "
          >
            Select Date
          </h2>
        </div>
  
        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-5
          "
        >
          {dates.map(
            (item) => {
              const active =
                selectedDate ===
                item.date;
  
              return (
                <button
                  key={
                    item.date
                  }
                  type="button"
                  onClick={() =>
                    onSelect(
                      item.date
                    )
                  }
                  className={`
                    flex
                    h-11
                    min-w-[52px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    text-xs
                    font-bold
                    transition-all
                    duration-300
  
                    ${
                      active
                        ? `
                            border-transparent
                            bg-gradient-to-r
                            from-[#087bea]
                            via-[#2563eb]
                            to-[#7c3aed]
                            text-white
                            shadow-[0_8px_20px_rgba(37,99,235,0.22)]
                          `
                        : `
                            border-[#dbe8f7]
                            bg-[#f8fbff]
                            text-[#426187]
                            hover:border-[#087bea]/25
                            hover:bg-[#edf7ff]
                          `
                    }
                  `}
                >
                  {item.date}
                </button>
              );
            }
          )}
        </div>
      </section>
    );
  }