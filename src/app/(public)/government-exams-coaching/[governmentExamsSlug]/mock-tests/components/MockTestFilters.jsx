export default function MockTestFilters({
  categories = [],
  activeFilter = 0,
  onChange,
}) {
  /* =======================================================
     NORMALIZE API DATA
  ======================================================= */

  const safeCategories =
    Array.isArray(categories)
      ? categories
          .filter(
            (item) =>
              item?.id !==
                undefined &&
              item?.id !==
                null &&
              String(
                item?.subcourse ??
                  ""
              ).trim()
          )
          .map((item) => ({
            id:
              Number(
                item.id
              ),

            label:
              String(
                item.subcourse
              ).trim(),
          }))
      : [];

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      id: 0,
      label: "All Exams",
    },
    ...safeCategories,
  ];

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-[#dce8f4]
        bg-white
        px-3
        py-2.5
        shadow-[0_10px_28px_rgba(15,58,110,0.05)]

        sm:px-4
        sm:py-3
      "
    >
      {/* =================================================
          SOFT BACKGROUND
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-[#f8fbff]
          via-white
          to-[#f8fbff]
        "
      />

      {/* =================================================
          SUBTLE LEFT GLOW
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-12
          top-1/2
          h-24
          w-24
          -translate-y-1/2
          rounded-full
          bg-[#00b5e8]/[0.05]
          blur-3xl
        "
      />

      {/* =================================================
          TABS
      ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          gap-1.5
          overflow-x-auto

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:flex-wrap
          sm:overflow-visible
        "
      >
        {tabs.map((tab) => {
          const active =
            Number(
              activeFilter
            ) ===
            Number(
              tab.id
            );

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                onChange?.(
                  Number(
                    tab.id
                  )
                )
              }
              aria-pressed={active}
              className={`
                group
                relative
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-[11px]
                border
                px-4
                py-2
                text-[12px]
                font-bold
                whitespace-nowrap
                transition-all
                duration-250

                sm:px-5
                sm:text-[11px]

                ${
                  active
                    ? `
                        border-[#0d78c5]
                        bg-gradient-to-r
                        from-[#164fa5]
                        via-[#087fd0]
                        to-[#00a8df]
                        text-white
                        shadow-[0_6px_16px_rgba(1,125,192,0.20)]
                      `
                    : `
                        border-transparent
                        bg-transparent
                        text-[#566b87]
                        hover:border-[#d8e7f4]
                        hover:bg-[#f4f9ff]
                        hover:text-[#164fa5]
                      `
                }
              `}
            >
              {/* ACTIVE INDICATOR */}

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  transition-all
                  duration-250

                  ${
                    active
                      ? `
                          bg-white
                          shadow-[0_0_0_3px_rgba(255,255,255,0.14)]
                        `
                      : `
                          bg-[#a7bdd2]
                          group-hover:bg-[#1688ed]
                        `
                  }
                `}
              />

              <span>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}