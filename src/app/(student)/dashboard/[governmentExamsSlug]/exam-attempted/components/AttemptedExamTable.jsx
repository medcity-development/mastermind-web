"use client";

import Link from "next/link";

import {
    BarChart3,
    FileQuestion,
} from "lucide-react";

import {
    formatExamDate,
    formatResultNumber,
    getAttemptExamName,
    getAttemptExamType,
    getAttemptId,
    getExamTypeLabel,
} from "../utils/examHistoryUtils";

/* =========================================================
   TABLE
========================================================= */

export default function AttemptedExamTable({
    attempts = [],
    governmentExamsSlug = "",
    startIndex = 0,
    loading = false,
}) {
    /* =======================================================
       LOADING
    ======================================================= */

    if (loading) {
        return (
            <section
                className="
          overflow-hidden
          rounded-[22px]
          border
          border-[#d8e5f4]
          bg-white
        "
            >
                <div
                    className="
            space-y-3
            p-5
          "
                >
                    {Array.from(
                        {
                            length: 5,
                        }
                    ).map(
                        (
                            _,
                            index
                        ) => (
                            <div
                                key={index}
                                className="
                  h-[68px]
                  animate-pulse
                  rounded-[14px]
                  bg-slate-100
                "
                            />
                        )
                    )}
                </div>
            </section>
        );
    }

    /* =======================================================
       EMPTY
    ======================================================= */

    if (
        !Array.isArray(
            attempts
        ) ||
        !attempts.length
    ) {
        return (
            <section
                className="
          rounded-[22px]
          border
          border-[#d8e5f4]
          bg-white

          px-6
          py-16

          text-center
        "
            >
                <FileQuestion
                    size={30}
                    className="
            mx-auto
            text-slate-300
          "
                />

                <h3
                    className="
            mt-4
            text-[16px]
            font-black
            text-[#082e5a]
          "
                >
                    No attempted exams
                </h3>

                <p
                    className="
            mt-1
            text-[12px]
            text-slate-500
          "
                >
                    Completed exam attempts
                    will appear here.
                </p>
            </section>
        );
    }

    /* =======================================================
       TABLE
    ======================================================= */

    return (
        <section
            className="
        overflow-hidden

        rounded-[22px]

        border
        border-[#d8e5f4]

        bg-white

        shadow-[0_12px_35px_rgba(15,23,42,0.04)]
      "
        >
            <div
                className="
          overflow-x-auto
        "
            >
                <table
                    className="
            w-full
            min-w-[1180px]
            border-collapse
          "
                >
                    <thead>
                        <tr
                            className="
                border-b
                border-slate-200

                bg-[#f7faff]
              "
                        >
                            <TableHeading>
                                #
                            </TableHeading>

                            <TableHeading>
                                Exam Name
                            </TableHeading>

                            <TableHeading>
                                Type
                            </TableHeading>

                            <TableHeading>
                                Score
                            </TableHeading>

                            <TableHeading>
                                Attempted
                            </TableHeading>

                            <TableHeading>
                                Correct
                            </TableHeading>

                            <TableHeading>
                                Wrong
                            </TableHeading>

                            <TableHeading>
                                Start Time
                            </TableHeading>

                            <TableHeading>
                                End Time
                            </TableHeading>

                            <TableHeading>
                                Result
                            </TableHeading>
                        </tr>
                    </thead>

                    <tbody>
                        {attempts.map(
                            (
                                attempt,
                                index
                            ) => {
                                const attemptId =
                                    getAttemptId(
                                        attempt
                                    );

                                const examType =
                                    getAttemptExamType(
                                        attempt
                                    );

                                const examName =
                                    getAttemptExamName(
                                        attempt
                                    );

                                const score =
                                    attempt?.user_score ??
                                    attempt?.userScore ??
                                    0;

                                const totalMark =
                                    attempt?.total_mark ??
                                    attempt?.totalMark ??
                                    0;

                                const attempted =
                                    attempt?.total_attempted ??
                                    attempt?.totalAttempted ??
                                    0;

                                const correct =
                                    attempt?.total_correct ??
                                    attempt?.totalCorrect ??
                                    0;

                                const wrong =
                                    attempt?.total_wrong ??
                                    attempt?.totalWrong ??
                                    0;

                                const startTime =
                                    attempt?.created_at ??
                                    attempt?.createdAt ??
                                    attempt?.start_time ??
                                    attempt?.startTime ??
                                    null;

                                const endTime =
                                    attempt?.modified_at ??
                                    attempt?.modifiedAt ??
                                    attempt?.updated_at ??
                                    attempt?.updatedAt ??
                                    attempt?.end_time ??
                                    attempt?.endTime ??
                                    null;

                                const analysisHref =
                                    attemptId &&
                                        examType &&
                                        governmentExamsSlug
                                        ? `/dashboard/${governmentExamsSlug}/exam-analysis?attemptId=${encodeURIComponent(
                                            String(
                                                attemptId
                                            )
                                        )}&examType=${encodeURIComponent(
                                            examType
                                        )}`
                                        : "";

                                return (
                                    <tr
                                        key={
                                            attempt?._historyId ??
                                            attemptId ??
                                            `${examType}-${index}`
                                        }
                                        className="
                      border-b
                      border-slate-100

                      transition-colors

                      last:border-b-0

                      hover:bg-[#f9fcff]
                    "
                                    >
                                        {/* NUMBER */}

                                        <TableCell>
                                            <span
                                                className="
                          font-black
                          text-[#082e5a]
                        "
                                            >
                                                {startIndex +
                                                    index +
                                                    1}
                                            </span>
                                        </TableCell>

                                        {/* EXAM NAME */}

                                        <TableCell>
                                            <div
                                                className="
                          min-w-[230px]
                        "
                                            >
                                                <p
                                                    className="
                            font-extrabold
                            leading-5
                            text-[#082e5a]
                          "
                                                >
                                                    {examName}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* TYPE */}

                                        <TableCell>
                                            <span
                                                className="
                          inline-flex

                          rounded-full

                          bg-[#e8f6fc]

                          px-3
                          py-1.5

                          text-[9px]
                          font-extrabold

                          text-[#017dc0]
                        "
                                            >
                                                {getExamTypeLabel(
                                                    examType
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* SCORE */}

                                        <TableCell>
                                            <div
                                                className="
                          whitespace-nowrap

                          font-black
                          text-[#082e5a]
                        "
                                            >
                                                {formatResultNumber(
                                                    score
                                                )}

                                                <span
                                                    className="
                            ml-1
                            text-[9px]
                            font-bold
                            text-slate-400
                          "
                                                >
                                                    /
                                                    {formatResultNumber(
                                                        totalMark
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* ATTEMPTED */}

                                        <TableCell>
                                            {formatResultNumber(
                                                attempted
                                            )}
                                        </TableCell>

                                        {/* CORRECT */}

                                        <TableCell>
                                            <span
                                                className="
                          font-black
                          text-emerald-600
                        "
                                            >
                                                {formatResultNumber(
                                                    correct
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* WRONG */}

                                        <TableCell>
                                            <span
                                                className="
                          font-black
                          text-red-500
                        "
                                            >
                                                {formatResultNumber(
                                                    wrong
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* START */}

                                        <TableCell>
                                            <span
                                                className="
                          whitespace-nowrap
                        "
                                            >
                                                {formatExamDate(
                                                    startTime
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* END */}

                                        <TableCell>
                                            <span
                                                className="
                          whitespace-nowrap
                        "
                                            >
                                                {formatExamDate(
                                                    endTime
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* ANALYSIS */}

                                        <TableCell>
                                            {analysisHref ? (
                                                <Link
                                                    href={
                                                        analysisHref
                                                    }
                                                    className="
                            inline-flex
                            min-h-[36px]
                            items-center
                            justify-center
                            gap-2

                            whitespace-nowrap

                            rounded-[11px]

                            bg-gradient-to-r
                            from-[#164fa5]
                            to-[#017dc0]

                            px-4

                            text-[10px]
                            font-extrabold
                            text-white

                            shadow-sm

                            transition-all

                            hover:-translate-y-0.5
                            hover:shadow-md
                          "
                                                >
                                                    <BarChart3
                                                        size={13}
                                                    />

                                                    View Analytics
                                                </Link>
                                            ) : (
                                                <span
                                                    className="
                            text-[10px]
                            font-bold
                            text-slate-400
                          "
                                                >
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* =========================================================
   HEADING
========================================================= */

function TableHeading({
    children,
}) {
    return (
        <th
            className="
        px-4
        py-4

        text-left

        text-[9px]
        font-extrabold
        uppercase
        tracking-[0.13em]

        text-slate-400
      "
        >
            {children}
        </th>
    );
}

/* =========================================================
   CELL
========================================================= */

function TableCell({
    children,
}) {
    return (
        <td
            className="
        px-4
        py-4

        text-[11px]
        font-semibold

        text-slate-600
      "
        >
            {children}
        </td>
    );
}