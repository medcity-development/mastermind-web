"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ArrowRight,
  BookOpen,
  Crown,
  FileQuestion,
  Gift,
  Target,
  X,
} from "lucide-react";

export default function PreviousQuestionCard({
  item,
  uid = 0,
  cid = 1,
  type = "pqp",
}) {
  const router = useRouter();

  const [
    showPremiumModal,
    setShowPremiumModal,
  ] = useState(false);

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

  function handlePremiumClick() {
    setShowPremiumModal(true);
  }

  function handleOk() {
    setShowPremiumModal(false);

    router.push("/login");
  }

  return (
    <>
      <article
        className={`
          group
          flex
          h-full
          flex-col
          rounded-[22px]
          border
          bg-white
          p-5
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
          sm:p-6

          ${
            isPaid
              ? "border-amber-200/80"
              : "border-emerald-200/80"
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

          {isPaid ? (
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
          {isPaid ? (
            <button
              type="button"
              onClick={
                handlePremiumClick
              }
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

              Premium
            </button>
          ) : (
            <Link
              href={`/government-exams-coaching/kerala-psc/previous-questions/${id}?uid=${uid}&cid=${cid}&type=${type}`}
              className="
                group/button
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-[12px]
                bg-green-200
                px-4
                py-3
                text-green-600 text-sm border border-green-300
                font-bold
                transition-all
                duration-300
                hover:bg-green-300
              "
            >
              Start Exam

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

      {showPremiumModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-slate-950/50
            px-4
            backdrop-blur-[3px]
          "
          onClick={() =>
            setShowPremiumModal(
              false
            )
          }
        >
          <div
            className="
              relative
              w-full
              max-w-[420px]
              rounded-[22px]
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setShowPremiumModal(
                  false
                )
              }
              className="
                absolute
                right-4
                top-4
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-slate-100
                text-slate-500
              "
            >
              <X size={16} />
            </button>

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[14px]
                bg-amber-50
                text-amber-600
              "
            >
              <Crown size={22} />
            </div>

            <h3
              className="
                mt-5
                text-[21px]
                font-extrabold
                text-[#0b1f44]
              "
            >
              Premium Access
            </h3>

            <p
              className="
                mt-2
                text-[14px]
                leading-6
                text-slate-500
              "
            >
              Please purchase a plan
              to access this exam.
            </p>

            <button
              type="button"
              onClick={handleOk}
              className="
                mt-6
                w-full
                rounded-[12px]
                bg-[#0b216c]
                px-4
                py-3
                text-[13px]
                font-bold
                text-white
              "
            >
              Login
            </button>
          </div>
        </div>
      )}
    </>
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