"use client";

export default function ExamHistoryTabs({
    tabs = [],
    activeTab = "all",
    onChange,
}) {
    if (
        !Array.isArray(
            tabs
        ) ||
        !tabs.length
    ) {
        return null;
    }

    return (
        <section
            className="
        overflow-x-auto

        rounded-[18px]

        border
        border-[#d8e5f4]

        bg-white

        p-2
      "
        >
            <div
                className="
          flex
          min-w-max
          items-center
          gap-2
        "
            >
                {tabs.map(
                    (tab) => {
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
                                    onChange?.(
                                        tab.key
                                    )
                                }
                                className={`
                  inline-flex
                  min-h-[40px]
                  items-center
                  gap-2

                  rounded-[11px]

                  px-4

                  text-[11px]
                  font-extrabold

                  transition-all

                  ${active
                                        ? `
                          bg-gradient-to-r
                          from-[#164fa5]
                          to-[#017dc0]

                          text-white

                          shadow-sm
                        `
                                        : `
                          bg-[#f7faff]

                          text-slate-600

                          hover:bg-[#edf7fd]
                          hover:text-[#017dc0]
                        `
                                    }
                `}
                            >
                                {tab.label}

                                <span
                                    className={`
                    inline-flex
                    min-w-6
                    items-center
                    justify-center

                    rounded-full

                    px-1.5
                    py-0.5

                    text-[9px]
                    font-black

                    ${active
                                            ? `
                            bg-white/15
                            text-white
                          `
                                            : `
                            bg-white
                            text-slate-500
                          `
                                        }
                  `}
                                >
                                    {tab.count ??
                                        0}
                                </span>
                            </button>
                        );
                    }
                )}
            </div>
        </section>
    );
}