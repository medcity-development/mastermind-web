import {
  CheckCircle2,
  Clock3,
  FileQuestion,
} from "lucide-react";

function formatTime(
  totalSeconds
) {
  const safeSeconds =
    Math.max(
      0,
      Number(
        totalSeconds
      ) || 0
    );

  const minutes =
    Math.floor(
      safeSeconds /
        60
    );

  const seconds =
    safeSeconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

export default function ScertExamHeader({
  exam,
  remainingSeconds,
  totalQuestions,
  answeredCount,
  currentPage,
  totalPages,
}) {
  const timeIsLow =
    remainingSeconds <=
    300;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[26px]
        bg-gradient-to-r
        from-[#071f55]
        via-[#075fc8]
        to-[#00a8df]
        px-6
        py-7
        text-white
        sm:px-8 mt-20
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          opacity-[0.07]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      <div
        className="
          relative
          z-10
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
              text-xs
              font-black
              uppercase
              tracking-[0.16em]
              text-blue-100
            "
          >
            SCERT Practice Exam
          </p>

          <h1
            className="
              mt-2
              max-w-3xl
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            {exam?.exam_name ||
              "SCERT Exam"}
          </h1>

          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-3
            "
          >
            <Info
              icon={
                FileQuestion
              }
              value={
                totalQuestions
              }
              label="Questions"
            />

            <Info
              icon={
                CheckCircle2
              }
              value={
                answeredCount
              }
              label="Answered"
            />

            <Info
              icon={
                FileQuestion
              }
              value={`${currentPage}/${totalPages}`}
              label="Page"
            />
          </div>
        </div>

        <div
          className={`
            min-w-[180px]
            rounded-2xl
            border
            px-5
            py-4
            text-center
            backdrop-blur
            ${
              timeIsLow
                ? "border-red-300/30 bg-red-500/20"
                : "border-white/15 bg-white/10"
            }
          `}
        >
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-blue-100
            "
          >
            <Clock3
              size={16}
            />

            Time Left
          </div>

          <p
            className={`
              mt-2
              text-3xl
              font-black
              ${
                timeIsLow
                  ? "text-red-100"
                  : "text-white"
              }
            `}
          >
            {formatTime(
              remainingSeconds
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function Info({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-white/10
        bg-white/10
        px-4
        py-3
      "
    >
      <Icon
        size={17}
      />

      <div>
        <p className="font-black">
          {value}
        </p>

        <p
          className="
            text-[10px]
            text-blue-100
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}