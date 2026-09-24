"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

function formatTime(totalSeconds) {
  const seconds = Math.max(
    0,
    Number(totalSeconds) || 0
  );

  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function MockTestHeader({
  exam,
  examTitle,
  remainingSeconds = 0,
}) {
  const router = useRouter();

  const lowTime =
    remainingSeconds <= 5 * 60;

  return (
    <header
      className="
        relative
        mt-20
        overflow-hidden
        bg-gradient-to-r
        from-[#071f55]
        via-[#164fa5]
        to-[#017dc0]
        px-6
        py-7
        text-white
        sm:px-8
        sm:py-8
      "
    >
      {/* GRID */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.07]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* GLOW */}
      <div
        aria-hidden="true"
        className="
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-cyan-300/20
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
        "
      >
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => router.back()}
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/15
            bg-white/10
            px-3
            py-2
            text-xs
            font-bold
            text-white
            backdrop-blur-sm
            transition-all
            duration-200
            hover:bg-white/20
            active:scale-[0.98]
          "
        >
          <ArrowLeft size={16} />

          Back
        </button>

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-blue-100
              "
            >
              Kerala PSC Mock Test
            </p>

            <h1
              className="
                mt-2
                max-w-3xl
                text-xl
                font-black
                leading-tight
                sm:text-2xl
              "
            >
              {exam?.exam_name ||
                examTitle ||
                "Mock Test"}
            </h1>

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
              "
            >
              <SmallStat
                icon={FileQuestion}
                label="Questions"
                value={
                  exam?.total_questions ??
                  "-"
                }
              />

              <SmallStat
                icon={Trophy}
                label="Marks"
                value={
                  exam?.total_mark ??
                  "-"
                }
              />
            </div>
          </div>

          {/* TIMER */}
          <div
            className={`
              min-w-[190px]
              rounded-[20px]
              border
              px-5
              py-4
              backdrop-blur-sm

              ${
                lowTime
                  ? `
                      border-rose-300/40
                      bg-rose-500/20
                    `
                  : `
                      border-white/15
                      bg-white/10
                    `
              }
            `}
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
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                "
              >
                <Clock3 size={21} />
              </div>

              <div>
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-blue-100
                  "
                >
                  Time Remaining
                </p>

                <p
                  className="
                    mt-1
                    font-mono
                    text-2xl
                    font-black
                  "
                >
                  {formatTime(
                    remainingSeconds
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SmallStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-white/10
        bg-white/10
        px-3
        py-2
      "
    >
      <Icon size={15} />

      <div>
        <p className="text-xs font-black">
          {value}
        </p>

        <p className="text-[9px] text-blue-100">
          {label}
        </p>
      </div>
    </div>
  );
}