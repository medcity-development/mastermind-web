// src/app/(public)/government-exams-coaching/[governmentExamsSlug]/competitive-exam-packs/CompetitiveExamPacks.jsx

import CompetitiveExamPackCard from "./CompetitiveExamPackCard";

import {
  getPackagesList,
} from "@/lib/packagesHelper";

export default async function CompetitiveExamPacks({
  cid,
  examName,
  governmentExamsSlug,
  uid = 0,
}) {
  const packages =
    await getPackagesList({
      uid,
      cid,
    });

  if (
    !Array.isArray(
      packages
    ) ||
    packages.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        relative
        my-5
        w-full
        overflow-hidden
        rounded-[24px]
        border
        border-[#e3edf7]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f5f9ff]
        px-4
        py-5
        shadow-[0_10px_30px_rgba(15,58,110,0.05)]
        sm:px-5
        sm:py-6
        lg:px-6
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-[#00b5e8]/[0.05]
          blur-[90px]
        "
      />

      <div className="relative z-10">
        <div
          className="
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-[#087bea]
              "
            >
              {examName}
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-[-0.035em]
                text-[#0b216c]
                sm:text-[28px]
              "
            >
              Competitive Exam Packs
            </h2>

            <div
              className="
                mt-2
                h-[3px]
                w-10
                rounded-full
                bg-[#f13873]
              "
            />
          </div>
        </div>

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
          "
        >
          {packages.map(
            (item) => (
              <CompetitiveExamPackCard
                key={
                  item.id
                }
                item={
                  item
                }
                cid={
                  cid
                }
                examName={
                  examName
                }
                governmentExamsSlug={
                  governmentExamsSlug
                }
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}