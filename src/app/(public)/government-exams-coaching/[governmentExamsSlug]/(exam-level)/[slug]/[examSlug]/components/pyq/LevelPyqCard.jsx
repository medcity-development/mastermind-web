"use client";

import Link from "next/link";

import {
  ArrowRight,
  Crown,
  FileQuestion,
  LockKeyhole,
  Trophy,
} from "lucide-react";

export default function LevelPyqCard({
  exam,
  uid = 0,
  cid = 1,
  onPremiumClick,
}) {
  if (!exam?.id) {
    return null;
  }

  const examId =
    exam.id;

  const title =
    exam?.exam_name ||
    exam?.exam ||
    exam?.name ||
    "Previous Question Paper";

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

  // =========================================================
  // FREE PYQ DETAILS URL
  // =========================================================

  const href = {
    pathname:
      `/government-exams-coaching/kerala-psc/previous-questions/${examId}`,

    query: {
      uid: String(uid),
      cid: String(cid),
      type: "pqp",
    },
  };

  return (
    <article
      className={`
        group
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
                from-amber-50
                via-white
                to-orange-50
                shadow-[0_12px_35px_rgba(245,158,11,0.08)]
                hover:shadow-[0_20px_45px_rgba(245,158,11,0.13)]
              `
            : `
                border-emerald-200
                bg-gradient-to-br
                from-emerald-50
                via-white
                to-green-50
                shadow-[0_12px_35px_rgba(16,185,129,0.07)]
                hover:shadow-[0_20px_45px_rgba(16,185,129,0.12)]
              `
        }
      `}
    >
      {/* =====================================================
          TOP
      ===================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
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
            rounded-[13px]

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
              size={18}
            />
          ) : (
            <FileQuestion
              size={18}
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
          {isPaid ? (
            <>
              <LockKeyhole
                size={11}
              />
              Premium
            </>
          ) : (
            "Free"
          )}
        </span>
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="mt-5">
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.13em]
            text-[#087bea]
          "
        >
          Kerala PSC PYQ
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

      {/* =====================================================
          STATS
      ===================================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >
        <Stat
          icon={
            FileQuestion
          }
          value={
            exam?.total_questions ??
            "-"
          }
          label="Questions"
        />

        <Stat
          icon={Trophy}
          value={
            exam?.total_mark ??
            "-"
          }
          label="Marks"
        />
      </div>

      {/* =====================================================
          ACTION
      ===================================================== */}

      <div
        className="
          mt-auto
          pt-5
        "
      >
        {isPaid ? (
          // =================================================
          // PREMIUM
          // NO NAVIGATION
          // OPEN MODAL
          // =================================================

          <button
            type="button"
            onClick={() =>
              onPremiumClick?.(
                exam
              )
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[13px]
              border
              border-amber-200
              bg-amber-100
              px-4
              py-3.5
              text-[11px]
              font-black
              text-amber-700
              transition-all
              duration-300
              hover:bg-amber-200
              active:scale-[0.99]
            "
          >
            <LockKeyhole
              size={14}
            />

            Unlock Premium

            <ArrowRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>
        ) : (
          // =================================================
          // FREE
          // NORMAL NAVIGATION
          // =================================================

          <Link
            href={href}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[13px]
              border
              border-emerald-200
              bg-emerald-100
              px-4
              py-3.5
              text-[11px]
              font-black
              text-emerald-700
              transition-all
              duration-300
              hover:bg-emerald-200
            "
          >
            Start PYQ

            <ArrowRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </Link>
        )}
      </div>
    </article>
  );
}

// =========================================================
// STAT
// =========================================================

function Stat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-white/90
        bg-white/75
        p-3.5
      "
    >
      <Icon
        size={15}
        className="
          text-[#075fc8]
        "
      />

      <p
        className="
          mt-2
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
          font-bold
          uppercase
          tracking-[0.05em]
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}