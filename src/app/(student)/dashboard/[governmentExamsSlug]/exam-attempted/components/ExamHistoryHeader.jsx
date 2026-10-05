"use client";

import {
    History,
    RefreshCw,
    Search,
} from "lucide-react";

export default function ExamHistoryHeader({
    examName,
    search,
    onSearch,
    loading,
    onRefresh,
}) {
    return (
        <section
            className="
        rounded-[24px]
        border
        border-[#d8e5f4]
        bg-white
        px-5
        py-5
        shadow-sm

        sm:px-6
      "
        >
            <div
                className="
          flex
          flex-col
          gap-5

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
            >
                <div
                    className="
            flex
            items-center
            gap-4
          "
                >
                    <div
                        className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-[15px]
              bg-[#e9f6fc]
              text-[#017dc0]
            "
                    >
                        <History
                            size={21}
                        />
                    </div>

                    <div>
                        <p
                            className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[#017dc0]
              "
                        >
                            {examName}
                        </p>

                        <h1
                            className="
                mt-1
                text-[24px]
                font-black
                tracking-tight
                text-[#082e5a]
              "
                        >
                            Exam History
                        </h1>

                        <p
                            className="
                mt-1
                text-sm
                text-slate-500
              "
                        >
                            Review all your
                            attempted exams and
                            detailed analytics.
                        </p>
                    </div>
                </div>

                <div
                    className="
            flex
            flex-col
            gap-3

            sm:flex-row
          "
                >
                    <div
                        className="
              flex
              min-h-[44px]
              items-center
              gap-2
              rounded-[13px]
              border
              border-slate-200
              bg-[#f8fbff]
              px-4
            "
                    >
                        <Search
                            size={16}
                            className="
                text-slate-400
              "
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                onSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search exams..."
                            className="
                min-w-0
                bg-transparent
                text-sm
                font-medium
                text-slate-700
                outline-none
                placeholder:text-slate-400

                sm:w-[220px]
              "
                        />
                    </div>

                    <button
                        type="button"
                        onClick={
                            onRefresh
                        }
                        disabled={
                            loading
                        }
                        className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              gap-2
              rounded-[13px]
              border
              border-[#d7e7f6]
              bg-[#f4faff]
              px-4
              text-[11px]
              font-extrabold
              text-[#017dc0]
              transition
              hover:bg-[#e8f6fc]
              disabled:opacity-50
            "
                    >
                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>
            </div>
        </section>
    );
}