"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  Crown,
  FileQuestion,
  LockKeyhole,
  Trophy,
} from "lucide-react";

function createSlug(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

export default function ScertTestCard({
  test,
  classId,
}) {
  const [
    showPremiumModal,
    setShowPremiumModal,
  ] = useState(false);

  if (!test?.id) {
    return null;
  }

  const examId =
    test.id;

  const isPaid =
    String(
      test?.access || ""
    )
      .toLowerCase()
      .trim() === "paid";

  const testSlug =
    createSlug(
      test?.exam_name ||
        "scert-practice-test"
    );

  const examHref = {
    pathname:
      `/government-exams-coaching/kerala-psc/scert-tests/tests/${testSlug}`,

    query: {
      classId:
        String(classId),
      examId:
        String(examId),
    },
  };

  return (
    <>
      <article
        className={`
          group
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          p-6
          shadow-[0_10px_30px_rgba(15,23,42,0.05)]
          transition-all
          duration-300
          hover:-translate-y-1

          ${
            isPaid
              ? `
                  border-amber-200
                  bg-gradient-to-br
                  from-amber-50
                  via-[#fffaf0]
                  to-white
                  hover:border-amber-300
                  hover:shadow-[0_20px_45px_rgba(217,119,6,0.12)]
                `
              : `
                  border-emerald-200
                  bg-gradient-to-br
                  from-emerald-50
                  via-[#f3fff8]
                  to-white
                  hover:border-emerald-300
                  hover:shadow-[0_20px_45px_rgba(16,185,129,0.12)]
                `
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
              h-12
              w-12
              items-center
              justify-center
              rounded-xl

              ${
                isPaid
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }
            `}
          >
            {isPaid ? (
              <Crown
                size={22}
              />
            ) : (
              <BookOpenCheck
                size={23}
              />
            )}
          </div>

          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              px-3
              py-1.5
              text-[11px]
              font-bold

              ${
                isPaid
                  ? "border-amber-200 bg-amber-100 text-amber-800"
                  : "border-emerald-200 bg-emerald-100 text-emerald-800"
              }
            `}
          >
            {isPaid ? (
              <>
                <Crown
                  size={13}
                />
                Premium
              </>
            ) : (
              "Free"
            )}
          </span>
        </div>

        <div className="mt-5">
          <p
            className={`
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]

              ${
                isPaid
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            `}
          >
            {test?.subcourse ||
              "SCERT"}
          </p>

          <h2
            className="
              mt-2
              text-lg
              font-black
              leading-7
              text-[#071f55]
            "
          >
            {test?.exam_name ||
              "SCERT Practice Test"}
          </h2>

          {test?.course ? (
            <p
              className="
                mt-2
                text-xs
                font-medium
                text-slate-500
              "
            >
              {test.course}
            </p>
          ) : null}
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
          "
        >
          <StatBox
            icon={FileQuestion}
            label="Questions"
            value={
              test?.total_questions
            }
            isPaid={isPaid}
          />

          <StatBox
            icon={Trophy}
            label="Marks"
            value={
              test?.total_mark
            }
            isPaid={isPaid}
          />
        </div>

        <div
          className="
            mt-auto
            pt-6
          "
        >
          {isPaid ? (
            <button
              type="button"
              onClick={() =>
                setShowPremiumModal(
                  true
                )
              }
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-amber-300
                bg-amber-100
                px-5
                py-3.5
                text-sm
                font-bold
                text-amber-800
                transition-all
                hover:bg-amber-200
              "
            >
              <LockKeyhole
                size={17}
              />

              Unlock Test
            </button>
          ) : (
            <Link
              href={examHref}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-emerald-300
                bg-emerald-100
                px-5
                py-3.5
                text-sm
                font-bold
                text-emerald-800
                transition-all
                hover:bg-emerald-200
              "
            >
              View Test

              <ArrowRight
                size={17}
              />
            </Link>
          )}
        </div>
      </article>

      {showPremiumModal ? (
        <PremiumModal
          onClose={() =>
            setShowPremiumModal(
              false
            )
          }
          redirectPath={
            `/government-exams-coaching/kerala-psc/scert-tests/tests/${testSlug}` +
            `?classId=${encodeURIComponent(
              classId
            )}` +
            `&examId=${encodeURIComponent(
              examId
            )}`
          }
        />
      ) : null}
    </>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  isPaid,
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        bg-white/75
        p-3

        ${
          isPaid
            ? "border-amber-100"
            : "border-emerald-100"
        }
      `}
    >
      <Icon
        size={16}
        className={
          isPaid
            ? "text-amber-600"
            : "text-emerald-600"
        }
      />

      <p
        className="
          mt-2
          text-[10px]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-0.5
          text-sm
          font-black
          text-slate-700
        "
      >
        {value ?? 0}
      </p>
    </div>
  );
}

function PremiumModal({
  onClose,
  redirectPath,
}) {
  function handleLogin() {
    window.location.href =
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`;
  }

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#020817]/65
        p-4
        backdrop-blur-sm
      "
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          w-full
          max-w-md
          rounded-[26px]
          border
          border-amber-200
          bg-gradient-to-br
          from-amber-50
          via-[#fffaf0]
          to-white
          p-7
          shadow-2xl
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-amber-100
            text-amber-700
          "
        >
          <Crown
            size={27}
          />
        </div>

        <h2
          className="
            mt-5
            text-2xl
            font-black
            text-[#071f55]
          "
        >
          Premium SCERT Test
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-slate-500
          "
        >
          Login and choose a plan
          to access this premium
          SCERT test.
        </p>

        <button
          type="button"
          onClick={
            handleLogin
          }
          className="
            mt-6
            w-full
            rounded-xl
            bg-amber-500
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            hover:bg-amber-600
          "
        >
          Login & View Plans
        </button>

        <button
          type="button"
          onClick={onClose}
          className="
            mt-2
            w-full
            px-5
            py-3
            text-sm
            font-bold
            text-slate-500
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}