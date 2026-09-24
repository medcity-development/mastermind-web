"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Crown,
  FileQuestion,
  LockKeyhole,
  Trophy,
  X,
} from "lucide-react";

export default function MockTestCard({
  test,
  uid = 0,
  cid,
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const router =
    useRouter();

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
      test?.access ||
        ""
    )
      .toLowerCase()
      .trim();

  const premium =
    access === "paid";

  const examPath =
    `/government-exams-coaching/${governmentExamsSlug}/mock-tests/${examId}`;

  function openPremiumModal(
    event
  ) {
    event?.preventDefault?.();

    event?.stopPropagation?.();

    setShowPremiumModal(
      true
    );
  }

  function goToLogin() {
    setShowPremiumModal(
      false
    );

    const returnUrl =
      encodeURIComponent(
        examPath
      );

    router.push(
      `/login?redirect=${returnUrl}`
    );
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
          rounded-[24px]
          border
          p-5
          transition-all
          duration-300
          hover:-translate-y-1

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
                  border-emerald-200
                  bg-gradient-to-br
                  from-emerald-50
                  via-white
                  to-green-50
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
              rounded-[13px]

              ${
                premium
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }
            `}
          >
            {premium ? (
              <Crown
                size={20}
              />
            ) : (
              <BookOpen
                size={20}
              />
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
                  : "bg-emerald-100 text-emerald-700"
              }
            `}
          >
            {premium
              ? "Premium"
              : "Free"}
          </span>
        </div>

        <div
          className="
            mt-5
          "
        >
          <p
            className={`
              text-[9px]
              font-black
              uppercase
              tracking-[0.1em]

              ${
                premium
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            `}
          >
            {examName}
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

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
          "
        >
          <InfoBox
            icon={
              FileQuestion
            }
            label="Questions"
            value={
              totalQuestions
            }
            premium={
              premium
            }
          />

          <InfoBox
            icon={
              Trophy
            }
            label="Marks"
            value={
              totalMark
            }
            premium={
              premium
            }
          />
        </div>

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
                    String(
                      uid
                    ),

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
                border
                border-emerald-200
                bg-emerald-100
                px-5
                py-3.5
                text-[11px]
                font-extrabold
                text-emerald-700
                transition
                hover:bg-emerald-200
              "
            >
              Start Exam

              <ArrowRight
                size={14}
              />
            </Link>
          )}
        </div>

        <span
          data-course-id={
            cid
          }
          data-course-slug={
            governmentExamsSlug
          }
          className="hidden"
        />
      </article>

      {showPremiumModal ? (
        <div
          className="
            fixed
            inset-0
            z-[99999]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setShowPremiumModal(
              false
            )
          }
        >
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="
              relative
              w-full
              max-w-[420px]
              rounded-[24px]
              border
              border-amber-200
              bg-white
              p-6
              shadow-2xl
            "
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
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-slate-100
              "
            >
              <X
                size={16}
              />
            </button>

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[16px]
                bg-amber-100
                text-amber-700
              "
            >
              <Crown
                size={25}
              />
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-black
                text-[#0b1f44]
              "
            >
              Premium plan required
            </h2>

            <p
              className="
                mt-2
                text-[12px]
                leading-6
                text-slate-500
              "
            >
              This {examName} mock
              test is available for
              premium users. Log in
              to continue.
            </p>

            <div
              className="
                mt-6
                flex
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowPremiumModal(
                    false
                  )
                }
                className="
                  rounded-[12px]
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-[11px]
                  font-bold
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  goToLogin
                }
                className="
                  rounded-[12px]
                  bg-gradient-to-r
                  from-amber-400
                  to-orange-400
                  px-5
                  py-3
                  text-[11px]
                  font-black
                  text-white
                "
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
            ? "border-amber-100 bg-amber-50"
            : "border-emerald-100 bg-emerald-50"
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
              : "bg-emerald-100 text-emerald-700"
          }
        `}
      >
        <Icon
          size={14}
        />
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