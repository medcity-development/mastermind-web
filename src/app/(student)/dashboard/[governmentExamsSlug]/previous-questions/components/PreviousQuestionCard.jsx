"use client";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Crown,
  FileQuestion,
  Gift,
  Pause,
  Target,
} from "lucide-react";

export default function PreviousQuestionCard({
  item,
  uid = 0,
  cid = 1,
  type = "pqp",
  governmentExamsSlug,
  pauseId,
}) {
  if (!item) {
    return null;
  }

  const {
    id,
    exam_name,
    total_questions,
    total_mark,
    course,
    subcourse,
    access,
  } = item;

  const isPaid =
    access === "paid";

  return (
      <article
        className={`
          group
          flex
          h-full
          flex-col
          rounded-[22px]
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
          sm:p-6

          ${
            isPaid
              ? "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50"
              : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-green-50"
          }
        `}
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[13px]
              border

              ${
                isPaid
                  ? `
                      border-amber-200
                      bg-amber-50
                      text-amber-600
                    `
                  : `
                      border-emerald-200
                      bg-emerald-50
                      text-emerald-600
                    `
              }
            `}
          >
            <FileQuestion
              size={21}
            />
          </div>

          {pauseId ? (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-amber-700
              "
            >
              <Pause size={12} />
              Paused
            </span>
          ) : isPaid ? (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-amber-700
              "
            >
              <Crown
                size={12}
              />

              Premium
            </span>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-emerald-700
              "
            >
              <Gift
                size={12}
              />

              Free
            </span>
          )}
        </div>

        {course && (
          <p
            className={`
              mt-5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]

              ${
                isPaid
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            `}
          >
            {course}
          </p>
        )}

        {exam_name && (
          <h3
            className="
              mt-2
              line-clamp-3
              min-h-[76px]
              text-[17px]
              font-extrabold
              leading-[1.5]
              text-[#0b1f44]
              sm:text-[18px]
            "
          >
            {exam_name}
          </h3>
        )}

        {subcourse && (
          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-[12px]
              font-medium
              text-slate-500
            "
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full

                ${
                  isPaid
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }
              `}
            />

            {subcourse}
          </div>
        )}

        <div
          className="
            my-5
            h-px
            bg-slate-100
          "
        />

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <StatBox
            icon={BookOpen}
            label="Questions"
            value={
              total_questions
            }
            isPaid={isPaid}
          />

          <StatBox
            icon={Target}
            label="Total Marks"
            value={total_mark}
            isPaid={isPaid}
          />
        </div>

        <div className="mt-auto pt-5">
          {isPaid && !pauseId ? (
            <Link
              href={isPaid && item?.packageAccess !== true ? `/dashboard/${governmentExamsSlug}?showPackages=1` : `/dashboard/${governmentExamsSlug}/previous-questions/${id}?uid=${uid}&cid=${cid}&type=${type}`}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[12px]
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-[12px]
                font-bold
                text-amber-700
                transition
                hover:bg-amber-100
              "
            >
              <Crown size={14} />

              View Premium Test
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href={pauseId
                ? {
                    pathname: `/dashboard/${governmentExamsSlug}/previous-questions/${id}/start`,
                    query: {
                      uid: String(uid),
                      cid: String(cid),
                      type: String(type),
                      mode: "resume",
                      pauseId: String(pauseId),
                    },
                  }
                : `/dashboard/${governmentExamsSlug}/previous-questions/${id}?uid=${uid}&cid=${cid}&type=${type}`}
              className="
                group/button
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[12px]
                border
                border-emerald-200
                bg-emerald-100
                px-4
                py-3
                text-sm
                font-bold
                text-emerald-800
                transition-all
                duration-300
                hover:bg-emerald-200
              "
            >
              {pauseId ? "Resume Exam" : "Start Exam"}

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-1
                "
              />
            </Link>
          )}
        </div>
      </article>

  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  isPaid,
}) {
  if (value == null) {
    return null;
  }

  return (
    <div
      className={`
        rounded-[14px]
        border
        p-3.5

        ${
          isPaid
            ? "border-amber-100"
            : "border-emerald-100"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <div
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-[8px]

            ${
              isPaid
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }
          `}
        >
          <Icon size={14} />
        </div>

        <span
          className="
            text-[10px]
            font-semibold
            text-slate-500
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-2
          text-[19px]
          font-extrabold
          text-[#0b1f44]
        "
      >
        {value}
      </p>
    </div>
  );
}
