import {
    Clock3,
    FileQuestion,
  } from "lucide-react";
  
  function formatTime(totalSeconds) {
    const value = Math.max(
      0,
      Number(totalSeconds) || 0
    );
  
    const hours =
      Math.floor(value / 3600);
  
    const minutes =
      Math.floor(
        (value % 3600) / 60
      );
  
    const seconds =
      value % 60;
  
    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
  
    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }
  
  export default function ExamHero({
    exam,
    questionsCount,
    timeLeft,
    durationMinutes,
  }) {
    const isTimeOver =
      durationMinutes > 0 &&
      timeLeft <= 0;
  
    const isLowTime =
      timeLeft > 0 &&
      timeLeft <= 60;
  
    return (
      <section
        className="
          relative
          mb-10
          overflow-hidden
          rounded-[26px]
          bg-gradient-to-r
          from-[#071f55]
          via-[#075fc8]
          to-[#017dc0]
          p-6
          text-white
          sm:p-8
        "
      >
        {/* GRID */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.06]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:34px_34px]
          "
        />
  
        {/* GLOW */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-56
            w-56
            rounded-full
            bg-white/10
            blur-3xl
          "
        />
  
        <div
          className="
            relative
            z-10
            grid
            gap-8
            lg:grid-cols-[1fr_auto]
            lg:items-center
          "
        >
          {/* LEFT CONTENT */}
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
            >
              Kerala PSC Topic Wise Exam
            </p>
  
            <h1
              className="
                mt-2
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              {exam?.exam_name}
            </h1>
  
            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
              "
            >
              <ExamBadge icon={FileQuestion}>
                {questionsCount} Questions
              </ExamBadge>
  
              <ExamBadge icon={Clock3}>
                {exam?.total_minutes || 0} Minutes
              </ExamBadge>
            </div>
          </div>
  
          {/* RIGHT TIMER */}
          <div
            className={`
              min-w-[210px]
              rounded-[22px]
              border
              p-5
              backdrop-blur-md
              ${
                isTimeOver
                  ? `
                    border-red-200/40
                    bg-red-500/15
                  `
                  : isLowTime
                    ? `
                      border-amber-200/40
                      bg-amber-400/15
                    `
                    : `
                      border-white/20
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
                  rounded-[14px]
                  bg-white/15
                  text-white
                "
              >
                <Clock3 size={20} />
              </div>
  
              <div>
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-blue-100
                  "
                >
                  Time Left
                </p>
  
                <p
                  className="
                    mt-1
                    text-3xl
                    font-black
                    leading-none
                    tabular-nums
                    text-white
                  "
                >
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
  
            <div
              className="
                mt-4
                h-px
                w-full
                bg-white/15
              "
            />
  
            <p
              className="
                mt-3
                text-[11px]
                leading-5
                text-blue-100
              "
            >
              {isTimeOver
                ? "Exam time has ended."
                : isLowTime
                  ? "Hurry, less than one minute remaining."
                  : `${durationMinutes || 0} minute exam`}
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  function ExamBadge({
    icon: Icon,
    children,
  }) {
    return (
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-white/10
          px-4
          py-2
          text-xs
          font-bold
          text-white
          backdrop-blur-sm
        "
      >
        <Icon size={15} />
  
        {children}
      </div>
    );
  }