import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Info,
  ShieldCheck,
  Target,
} from "lucide-react";

export default function ExamInstructions({
  exam,
  instructions = [],
  examId,
  uid,
  cid,
  type,
  view,
}) {
  if (!exam) {
    return null;
  }

  return (
    <section className="mt-6">
      <div
        className="
          grid
          gap-6
          lg:grid-cols-[minmax(0,1fr)_360px]
        "
      >
        {/* LEFT - INSTRUCTIONS */}
        <div
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-white
            shadow-[0_12px_35px_rgba(15,23,42,0.04)]
          "
        >
          {/* HEADER */}
          <div
            className="
              border-b
              border-slate-100
              px-5
              py-5
              sm:px-7
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-blue-50
                  text-[#164fa5]
                "
              >
                <BookOpenCheck size={20} />
              </div>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[#017cc0]
                  "
                >
                  Before You Start
                </p>

                <h2
                  className="
                    mt-1
                    text-[19px]
                    font-extrabold
                    text-[#0b1f44]
                    sm:text-[21px]
                  "
                >
                  Exam Instructions
                </h2>
              </div>
            </div>
          </div>

          {/* INSTRUCTION LIST */}
          <div
            className="
              space-y-3
              p-5
              sm:p-7
            "
          >
            {Array.isArray(instructions) &&
            instructions.length > 0 ? (
              instructions.map((item, index) => (
                <div
                  key={`${item?.instructions}-${index}`}
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-[14px]
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-4
                  "
                >
                  <div
                    className="
                      mt-0.5
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-100
                      text-emerald-700
                    "
                  >
                    <CheckCircle2 size={14} />
                  </div>

                  <div className="flex-1">
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                      "
                    >
                      Instruction {index + 1}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[13px]
                        font-medium
                        leading-7
                        text-slate-700
                        sm:text-[14px]
                      "
                    >
                      {item?.instructions ||
                        "Instruction not available."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="
                  rounded-[14px]
                  border
                  border-dashed
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-8
                  text-center
                "
              >
                <p
                  className="
                    text-[13px]
                    font-medium
                    text-slate-500
                  "
                >
                  No instructions available.
                </p>
              </div>
            )}
          </div>

          {/* IMPORTANT NOTE */}
          <div
            className="
              border-t
              border-slate-100
              bg-blue-50/50
              px-5
              py-5
              sm:px-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-[10px]
                  bg-blue-100
                  text-[#164fa5]
                "
              >
                <Info size={16} />
              </div>

              <div>
                <p
                  className="
                    text-[12px]
                    font-bold
                    text-[#0b1f44]
                  "
                >
                  Important Note
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    leading-6
                    text-slate-600
                  "
                >
                  Read every question carefully. Complete the
                  test within the given duration and use the
                  Submit & Finish button when you are done.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - SUMMARY */}
        <aside
          className="
            h-fit
            rounded-[22px]
            border
            border-slate-200
            bg-white
            p-5
            shadow-[0_12px_35px_rgba(15,23,42,0.04)]
            lg:sticky
            lg:top-24
          "
        >
          {/* SUMMARY HEADER */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-[#017cc0]
                "
              >
                Exam Summary
              </p>

              <h3
                className="
                  mt-1
                  text-[18px]
                  font-extrabold
                  text-[#0b1f44]
                "
              >
                Test Details
              </h3>
            </div>

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-[12px]
                bg-blue-50
                text-[#164fa5]
              "
            >
              <FileQuestion size={20} />
            </div>
          </div>

          {/* SUMMARY ITEMS */}
          <div
            className="
              mt-5
              space-y-3
            "
          >
            <SummaryItem
              icon={FileQuestion}
              label="Questions"
              value={exam?.total_questions ?? "-"}
            />

            <SummaryItem
              icon={Target}
              label="Total Marks"
              value={exam?.total_mark ?? "-"}
            />

            <SummaryItem
              icon={Clock3}
              label="Duration"
              value={
                exam?.total_minutes
                  ? `${exam.total_minutes} Minutes`
                  : "-"
              }
            />

            <SummaryItem
              icon={ShieldCheck}
              label="Access"
              value={
                exam?.access === "paid"
                  ? "Premium"
                  : "Free"
              }
            />
          </div>

          <div className="my-5 h-px bg-slate-100" />

          {/* EXTRA DETAILS */}
          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <DetailBox
              label="Exam Date"
              value={exam?.dateofexam}
            />

            <DetailBox
              label="QP Code"
              value={exam?.qpcode}
            />
          </div>

        

          {/* START BUTTON */}
          <Link
            href={`/government-exams-coaching/kerala-psc/previous-questions/${examId}/start?uid=${uid}&cid=${cid}&type=${type}`}
            className="
              group
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[13px]
              bg-gradient-to-r
  from-purple-600
  via-violet-500
  to-[#164fa5]
              px-5
              py-3.5
              text-[12px]
              font-bold
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#164fa5]
              hover:shadow-[0_12px_25px_rgba(22,79,165,0.22)]
            "
          >
            Start Exam

            <ArrowRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>

          <p
            className="
              mt-3
              text-center
              text-[10px]
              leading-5
              text-slate-400
            "
          >
            Make sure you have enough uninterrupted time
            before starting the test.
          </p>
        </aside>
      </div>
    </section>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-[13px]
        border
        border-slate-100
        bg-white
        p-3.5
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          bg-blue-50
          text-[#164fa5]
        "
      >
        <Icon size={16} />
      </div>

      <div>
        <p
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-[13px]
            font-extrabold
            text-[#0b1f44]
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailBox({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-[13px]
        bg-slate-50
        p-3.5
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-[12px]
          font-bold
          leading-5
          text-[#0b1f44]
        "
      >
        {value || "-"}
      </p>
    </div>
  );
}