"use client";

import Link from "next/link";

import {
  ArrowRight,
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

  const access =
    String(
      exam?.access || ""
    )
      .toLowerCase()
      .trim();

  const isPaid =
    access === "paid";

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

  function handlePremium() {
    console.log(
      "CARD PREMIUM CLICK:",
      exam
    );

    if (
      typeof onPremiumClick ===
      "function"
    ) {
      onPremiumClick(
        exam
      );
    } else {
      console.error(
        "onPremiumClick is missing"
      );
    }
  }

  return (
    <article
      className={`
        flex
        h-full
        flex-col
        rounded-[24px]
        border
        p-5

        ${
          isPaid
            ? `
                border-amber-200
                bg-amber-50/40
              `
            : `
                border-emerald-200
                bg-emerald-50/40
              `
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
        "
      >
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl

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
        </div>

        <span
          className={`
            rounded-full
            px-3
            py-1
            text-[9px]
            font-black
            uppercase

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
          {isPaid
            ? "Premium"
            : "Free"}
        </span>
      </div>

      <h3
        className="
          mt-5
          text-[17px]
          font-black
          text-[#071f55]
        "
      >
        {title}
      </h3>

      {exam?.subcourse ? (
        <p
          className="
            mt-2
            text-[11px]
            text-slate-500
          "
        >
          {exam.subcourse}
        </p>
      ) : null}

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

      <div
        className="
          mt-auto
          pt-5
        "
      >
        {isPaid ? (
          <button
            type="button"
            onClick={
              handlePremium
            }
            className="
              flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-amber-100
              px-5
              text-[11px]
              font-black
              text-amber-700
              transition
              hover:bg-amber-200
            "
          >
            <LockKeyhole
              size={15}
            />

            Unlock Premium

            <ArrowRight
              size={14}
            />
          </button>
        ) : (
          <Link
            href={href}
            className="
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
            "
          >
            Start Exam

            <ArrowRight
              size={14}
            />
          </Link>
        )}
      </div>
    </article>
  );
}

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
        border-slate-100
        bg-white
        p-3
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
          font-black
          text-[#071f55]
        "
      >
        {value}
      </p>

      <p
        className="
          text-[8px]
          uppercase
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}