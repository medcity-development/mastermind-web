"use client";

import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  Crown,
  FileQuestion,
  LockKeyhole,
  Trophy,
} from "lucide-react";

export default function LevelMockTestCard({
  exam,
  cid = 1,
  uid = 0,
  onPremiumClick,
}) {
  if (!exam) {
    return null;
  }

  const examId =
    exam?.id;

  const title =
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    "Mock Test";

  const subcourse =
    exam?.subcourse ||
    exam?.course ||
    "";

  const access =
    String(
      exam?.access || ""
    )
      .toLowerCase()
      .trim();

  const isPaid =
    access === "paid";

  const totalQuestions =
    exam?.total_questions ??
    "-";

  const totalMarks =
    exam?.total_mark ??
    "-";

  const href = {
    pathname:
      `/government-exams-coaching/kerala-psc/mock-tests/${examId}`,
    query: {
      uid:
        String(uid),
      cid:
        String(cid),
      title,
    },
  };

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        p-5
        transition-all
        duration-300
        hover:-translate-y-1

        ${
          isPaid
            ? `
                border-amber-200
                bg-gradient-to-br
                from-[#fffdf5]
                via-white
                to-[#fff8dd]
                hover:shadow-[0_18px_45px_rgba(217,119,6,0.10)]
              `
            : `
                border-emerald-200
                bg-gradient-to-br
                from-[#f3fff9]
                via-white
                to-[#ecfdf5]
                hover:shadow-[0_18px_45px_rgba(5,150,105,0.10)]
              `
        }
      `}
    >
      {/* DECORATION */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          blur-3xl

          ${
            isPaid
              ? "bg-amber-200/30"
              : "bg-emerald-200/25"
          }
        `}
      />

      {/* TOP */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <span
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[14px]

            ${
              isPaid
                ? `
                    bg-amber-100
                    text-amber-700
                  `
                : `
                    bg-emerald-100
                    text-emerald-700
                  `
            }
          `}
        >
          {isPaid ? (
            <Crown
              size={19}
            />
          ) : (
            <BookOpenCheck
              size={19}
            />
          )}
        </span>

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.06em]

            ${
              isPaid
                ? `
                    bg-amber-100
                    text-amber-700
                  `
                : `
                    bg-emerald-100
                    text-emerald-700
                  `
            }
          `}
        >
          {isPaid && (
            <Crown
              size={11}
            />
          )}

          {isPaid
            ? "Premium"
            : "Free"}
        </span>
      </div>

      {/* TITLE */}

      <div
        className="
          relative
          z-10
          mt-5
        "
      >
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-[#075fc8]
          "
        >
          Kerala PSC
        </p>

        <h3
          className="
            mt-2
            line-clamp-2
            text-[17px]
            font-black
            leading-6
            text-[#071f55]
          "
        >
          {title}
        </h3>

        {subcourse ? (
          <p
            className="
              mt-2
              line-clamp-1
              text-[11px]
              font-medium
              text-slate-500
            "
          >
            {subcourse}
          </p>
        ) : null}
      </div>

      {/* STATS */}

      <div
        className="
          relative
          z-10
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >
        <StatCard
          icon={
            FileQuestion
          }
          value={
            totalQuestions
          }
          label="Questions"
          isPaid={
            isPaid
          }
        />

        <StatCard
          icon={Trophy}
          value={
            totalMarks
          }
          label="Marks"
          isPaid={
            isPaid
          }
        />
      </div>

      {/* ACTION */}

      <div
        className="
          relative
          z-10
          mt-auto
          pt-5
        "
      >
        {isPaid ? (
          <button
            type="button"
            onClick={() =>
              onPremiumClick?.(
                exam
              )
            }
            className="
              group/button
              flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-amber-200
              bg-amber-100
              px-5
              text-[11px]
              font-black
              text-amber-700
              transition-all
              duration-300
              hover:border-amber-300
              hover:bg-amber-200 cursor-pointer
            "
          >
            <LockKeyhole
              size={15}
            />

            Unlock Premium

            <ArrowRight
              size={14}
              className="
                transition-transform
                group-hover/button:translate-x-1
              "
            />
          </button>
        ) : (
          <Link
            href={href}
            className="
              group/button
              flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-emerald-100
              px-5
              text-[11px]
              font-black
              text-emerald-700
              transition-all
              duration-300
              hover:bg-emerald-200
            "
          >
            Start Exam

            <ArrowRight
              size={15}
              className="
                transition-transform
                group-hover/button:translate-x-1
              "
            />
          </Link>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  icon: Icon,
  value,
  label,
  isPaid,
}) {
  return (
    <div
      className={`
        rounded-[15px]
        border
        p-3.5

        ${
          isPaid
            ? `
                border-amber-100
                bg-amber-50/70
              `
            : `
                border-emerald-100
                bg-emerald-50/70
              `
        }
      `}
    >
      <span
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-[9px]

          ${
            isPaid
              ? `
                  bg-amber-100
                  text-amber-700
                `
              : `
                  bg-emerald-100
                  text-emerald-700
                `
          }
        `}
      >
        <Icon
          size={15}
        />
      </span>

      <p
        className="
          mt-3
          text-[15px]
          font-black
          text-[#071f55]
        "
      >
        {value}
      </p>

      <p
        className="
          mt-0.5
          text-[8px]
          font-black
          uppercase
          tracking-[0.08em]
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}