"use client";

import { useState } from "react";
import {
    History,
} from "lucide-react";

import ExamHistoryTable from "./ExamHistoryTable";
import ExamHistoryEmpty from "./ExamHistoryEmpty";

const PAGE_SIZE = 10;

export default function ExamHistorySection({
    attempts = [],
}) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(attempts.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, attempts.length);

    return (
        <section
            className="
        mt-6

        overflow-hidden

        rounded-[28px]

        border
        border-[#dce8f7]

        bg-white

        shadow-[0_18px_50px_rgba(15,23,42,0.055)]
      "
        >
            <header
                className="
          flex
          items-center
          justify-between
          gap-4

          border-b
          border-[#e1ebf6]

          bg-gradient-to-r
          from-white
          via-[#f7fbff]
          to-[#f4f2ff]

          px-6
          py-5
        "
            >
                <div
                    className="
            flex
            items-center
            gap-3
          "
                >
                    <div
                        className="
              flex
              h-11
              w-11
              items-center
              justify-center

              rounded-[14px]

              bg-gradient-to-br
              from-[#164fa5]
              to-[#017dc0]

              text-white
            "
                    >
                        <History
                            size={19}
                        />
                    </div>

                    <div>
                        <p
                            className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.15em]
                text-[#017dc0]
              "
                        >
                            Activity
                        </p>

                        <h2
                            className="
                text-[19px]
                font-black
                text-[#071f55]
              "
                        >
                            Exam History
                        </h2>
                    </div>
                </div>

                <span
                    className="
            rounded-full

            border
            border-blue-100

            bg-white

            px-3
            py-2

            text-[9px]
            font-black

            text-[#017dc0]
          "
                >
                    {attempts.length} records
                </span>
            </header>

            {attempts.length ? (
                <>
                    <ExamHistoryTable
                        key={currentPage}
                        startIndex={startIndex}
                        attempts={
                            attempts.slice(startIndex, endIndex)
                        }
                    />

                    <footer
                        className="
              flex
              flex-wrap
              gap-3
              items-center
              justify-between

              border-t
              border-slate-100

              bg-[#fbfdff]

              px-6
              py-3

              text-[9px]
              text-slate-400
            "
                    >
                        <span aria-live="polite">
                            Showing {startIndex + 1}–{endIndex} of {attempts.length} saved attempts
                        </span>

                        <nav aria-label="Exam history pagination" className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] font-bold text-[#017dc0] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-[11px] font-semibold text-slate-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] font-bold text-[#017dc0] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </nav>
                    </footer>
                </>
            ) : (
                <ExamHistoryEmpty />
            )}
        </section>
    );
}
