"use client";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Crown,
  FileQuestion,
  LockKeyhole,
  Trophy,
} from "lucide-react";

import {
  useState,
} from "react";

import PremiumMockTestModal from "./PremiumMockTestModal";

export default function MockTestCard({
  test,
  uid = 0,
  cid,
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const [
    showPremiumModal,
    setShowPremiumModal,
  ] = useState(false);

  if (
    !test?.id ||
    !governmentExamsSlug
  ) {
    return null;
  }

  const examId =
    test.id;

  const testTitle =
    test?.exam_name ||
    `${examName} Mock Test`;

  const totalQuestions =
    test?.total_questions;

  const totalMark =
    test?.total_mark;

  const course =
    test?.course;

  const subcourse =
    test?.subcourse;

  const access =
    String(
      test?.access || ""
    )
      .toLowerCase()
      .trim();

  const premium =
    access === "paid";

  /* =======================================================
     PRIVATE DASHBOARD ROUTE
  ======================================================= */

  const examPath =
    `/dashboard/${governmentExamsSlug}/mock-tests/${examId}`;

  function openPremiumModal(
    event
  ) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    setShowPremiumModal(true);
  }

  return (
    <>
      <article
        className={`
          group
          relative

          flex
          h-full
          flex-col

          overflow-hidden

          rounded-[22px]

          border

          p-5

          shadow-[0_10px_30px_rgba(15,23,42,0.04)]

          transition-all
          duration-300

          hover:-translate-y-1
          hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]

          ${
            premium
              ? `
                  border-amber-200
                  bg-gradient-to-br
                  from-amber-50
                  via-white
                  to-orange-50
                `
              : `
                  border-blue-100
                  bg-gradient-to-br
                  from-[#f7fbff]
                  via-white
                  to-[#f5f3ff]
                `
          }
        `}
      >
        {/* HEADER */}

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

              rounded-[13px]

              ${
                premium
                  ? "bg-amber-100 text-amber-700"
                  : "bg-[#e6f3ff] text-[#176ed1]"
              }
            `}
          >
            {premium ? (
              <Crown size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </div>

          <span
            className={`
              rounded-full

              px-3
              py-1.5

              text-[9px]
              font-black
              uppercase

              ${
                premium
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-50 text-blue-700"
              }
            `}
          >
            {premium
              ? "Premium"
              : "Free"}
          </span>
        </div>

        {/* TITLE */}

        <div className="mt-5">
          <p
            className={`
              text-[9px]
              font-black
              uppercase
              tracking-[0.1em]

              ${
                premium
                  ? "text-amber-700"
                  : "text-blue-600"
              }
            `}
          >
            {shortName || examName}
          </p>

          <h3
            className="
              mt-2

              text-[17px]
              font-extrabold
              leading-6

              text-[#0b1f44]
            "
          >
            {testTitle}
          </h3>

          {subcourse ? (
            <p
              className="
                mt-2
                text-[11px]
                text-slate-500
              "
            >
              {subcourse}
            </p>
          ) : null}

          {course ? (
            <p
              className="
                mt-1
                text-[10px]
                text-slate-400
              "
            >
              {course}
            </p>
          ) : null}
        </div>

        {/* INFO */}

        <div
          className="
            mt-5

            grid
            grid-cols-2
            gap-3
          "
        >
          <InfoBox
            icon={FileQuestion}
            label="Questions"
            value={totalQuestions}
            premium={premium}
          />

          <InfoBox
            icon={Trophy}
            label="Marks"
            value={totalMark}
            premium={premium}
          />
        </div>

        {/* ACTION */}

        <div
          className="
            mt-auto
            pt-5
          "
        >
          {premium ? (
            <button
              type="button"
              onClick={
                openPremiumModal
              }
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2

                rounded-[13px]

                border
                border-amber-200

                bg-amber-100

                px-5
                py-3.5

                text-[11px]
                font-extrabold
                text-amber-700

                transition

                hover:bg-amber-200
              "
            >
              <LockKeyhole
                size={14}
              />

              Unlock Premium
            </button>
          ) : (
            <Link
              href={{
                pathname:
                  examPath,

                query: {
                  uid:
                    String(uid),

                  title:
                    testTitle,
                },
              }}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2

                rounded-[13px]

                bg-gradient-to-r
                from-[#164fa5]
                via-[#087fd0]
                to-[#3154ee]

                px-5
                py-3.5

                text-[11px]
                font-extrabold
                text-white

                shadow-[0_10px_24px_rgba(49,84,238,0.18)]

                transition-all

                hover:-translate-y-0.5
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

      <PremiumMockTestModal
        open={showPremiumModal}
        test={test}
        governmentExamsSlug={
          governmentExamsSlug
        }
        onClose={() =>
          setShowPremiumModal(
            false
          )
        }
      />
    </>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
  premium,
}) {
  return (
    <div
      className={`
        rounded-[14px]

        border

        px-3
        py-3

        ${
          premium
            ? `
                border-amber-100
                bg-amber-50
              `
            : `
                border-blue-100
                bg-blue-50/70
              `
        }
      `}
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
            premium
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700"
          }
        `}
      >
        <Icon size={14} />
      </div>

      <p
        className="
          mt-2
          font-extrabold
          text-[#0b1f44]
        "
      >
        {value ?? "-"}
      </p>

      <p
        className="
          text-[8px]
          font-bold
          uppercase
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}