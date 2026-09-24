"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import CurrentAffairsQuizMonths from "./CurrentAffairsQuizMonths";
import CurrentAffairsQuizTabs from "./CurrentAffairsQuizTabs";

export default function CurrentAffairsQuizContent() {
  const [selectedMonth, setSelectedMonth] =
    useState(null);

  /*
   * =====================================
   * MONTH LIST
   * =====================================
   */

  if (!selectedMonth) {
    return (
      <CurrentAffairsQuizMonths
        cid={1}
        uid={0}
        onSelect={(month) => {
          console.log(
            "SELECTED MONTH:",
            month
          );

          setSelectedMonth(
            month
          );
        }}
      />
    );
  }

  /*
   * =====================================
   * SELECTED MONTH
   * =====================================
   */

  return (
    <section
      className="
        mt-6
        overflow-hidden
        rounded-[28px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_18px_55px_rgba(11,33,108,0.07)]
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
          border-b
          border-[#e5edf8]
          bg-[#f8fbff]
          px-5
          py-5
          sm:px-7
        "
      >
        <button
          type="button"
          onClick={() =>
            setSelectedMonth(null)
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-[#dce8f7]
            bg-white
            px-4
            py-2.5
            text-[11px]
            font-black
            text-[#164fa5]
            shadow-sm
            transition
            hover:border-[#164fa5]/30
          "
        >
          <ArrowLeft size={15} />

          Back to Months
        </button>

        <div className="text-right">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-[#087bea]
            "
          >
            Quiz Practice
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              text-[#102c5c]
            "
          >
            {selectedMonth?.month}{" "}
            {selectedMonth?.year}
          </h2>
        </div>
      </div>

      {/*
       * IMPORTANT:
       *
       * Pass selectedMonth.id.
       *
       * July:
       * id = 131
       */}

      <CurrentAffairsQuizTabs
        monthId={
          selectedMonth?.id
        }
        uid={0}
      />
    </section>
  );
}