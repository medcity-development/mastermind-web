"use client";

import Link from "next/link";

import {
  BarChart3,
  FileQuestion,
} from "lucide-react";

export default function ExamHistoryTable({
  rows = [],
  loading = false,
}) {
  return (
    <section
      className="
        overflow-hidden

        rounded-[24px]

        border
        border-[#d8e5f4]

        bg-white

        shadow-[0_15px_40px_rgba(15,23,42,0.05)]
      "
    >
      {/* ===================================================
          TABLE TITLE
      =================================================== */}

      <div
        className="
          border-b
          border-slate-100

          px-5
          py-5

          sm:px-6
        "
      >
        <h2
          className="
            text-[18px]
            font-black
            text-[#082e5a]
          "
        >
          Exam Analysis
        </h2>

        <p
          className="
            mt-1
            text-[12px]
            text-slate-500
          "
        >
          Select an exam type to
          view your previous attempts.
        </p>
      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (
        <div
          className="
            p-5
          "
        >
          <div
            className="
              h-[72px]
              animate-pulse
              rounded-[16px]
              bg-slate-100
            "
          />
        </div>
      ) : null}

      {/* ===================================================
          EMPTY
      =================================================== */}

      {!loading &&
      !rows.length ? (
        <div
          className="
            px-6
            py-14
            text-center
          "
        >
          <FileQuestion
            size={26}
            className="
              mx-auto
              text-slate-300
            "
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-500
            "
          >
            No exam history found.
          </p>
        </div>
      ) : null}

      {/* ===================================================
          TABLE
      =================================================== */}

      {!loading &&
      rows.length ? (
        <div
          className="
            overflow-x-auto
          "
        >
          <table
            className="
              w-full
              min-w-[750px]
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
                  Total Attempts
                </TableHeading>

                <TableHeading>
                  View Details
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (
                  row,
                  index
                ) => (
                  <tr
                    key={
                      row.id
                    }
                    className="
                      border-b
                      border-slate-100

                      transition

                      last:border-b-0

                      hover:bg-[#f8fbff]
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
                        {index +
                          1}
                      </span>
                    </TableCell>

                    {/* EXAM */}

                    <TableCell>
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
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center

                            rounded-[11px]

                            bg-[#e8f6fc]

                            text-[#017dc0]
                          "
                        >
                          <FileQuestion
                            size={16}
                          />
                        </div>

                        <span
                          className="
                            font-bold
                            text-slate-700
                          "
                        >
                          {row.examName}
                        </span>
                      </div>
                    </TableCell>

                    {/* TOTAL */}

                    <TableCell>
                      <span
                        className="
                          inline-flex
                          min-w-[42px]
                          items-center
                          justify-center

                          rounded-full

                          bg-[#eef7ff]

                          px-3
                          py-1.5

                          text-[11px]
                          font-black
                          text-[#017dc0]
                        "
                      >
                        {row.totalAttempts}
                      </span>
                    </TableCell>

                    {/* LINK */}

                    <TableCell>
                      <Link
                        href={
                          row.href
                        }
                        className="
                          inline-flex
                          min-h-[36px]
                          items-center
                          justify-center
                          gap-2

                          rounded-[11px]

                          bg-gradient-to-r
                          from-[#164fa5]
                          to-[#017dc0]

                          px-4

                          text-[10px]
                          font-extrabold
                          text-white

                          shadow-sm

                          transition

                          hover:-translate-y-0.5
                        "
                      >
                        <BarChart3
                          size={13}
                        />

                        View Analytics
                      </Link>
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* ===================================================
          FOOTER
      =================================================== */}

      {!loading &&
      rows.length ? (
        <div
          className="
            border-t
            border-slate-100

            bg-[#fbfdff]

            px-5
            py-3

            text-[10px]
            font-semibold
            text-slate-500

            sm:px-6
          "
        >
          Showing 1 to{" "}
          {rows.length} of{" "}
          {rows.length}{" "}
          entries
        </div>
      ) : null}
    </section>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}) {
  return (
    <th
      className="
        px-5
        py-4

        text-left

        text-[9px]
        font-extrabold
        uppercase
        tracking-[0.14em]

        text-slate-400

        sm:px-6
      "
    >
      {children}
    </th>
  );
}

/* =========================================================
   TABLE CELL
========================================================= */

function TableCell({
  children,
}) {
  return (
    <td
      className="
        px-5
        py-4

        text-[12px]
        font-semibold
        text-slate-600

        sm:px-6
      "
    >
      {children}
    </td>
  );
}