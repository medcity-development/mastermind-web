import {
    Brain,
    CheckCircle2,
    CircleHelp,
    Trophy,
  } from "lucide-react";
  
  const statStyles = {
    answered: {
      box: "from-[#fff1f6] to-[#fff8fb]",
      border: "border-[#f6c4d7]",
      icon: "bg-[#f13873] text-white",
      label: "text-[#a61e52]",
      value: "text-[#7d163f]",
    },
  
    correct: {
      box: "from-[#ecfdf5] to-[#f6fffb]",
      border: "border-[#b7ebd6]",
      icon: "bg-[#10b981] text-white",
      label: "text-[#047857]",
      value: "text-[#065f46]",
    },
  
    progress: {
      box: "from-[#f5f3ff] to-[#fbfaff]",
      border: "border-[#d8ccff]",
      icon: "bg-[#7c3aed] text-white",
      label: "text-[#6d28d9]",
      value: "text-[#4c1d95]",
    },
  };
  
  export default function QuizSummary({
    quiz,
    totalQuestions,
    questionsPerPage,
    answeredCount,
    correctCount,
    progress,
  }) {
    return (
      <section
        className="
          relative
          mb-6
          overflow-hidden
          rounded-[28px]
          border
          border-[#efd6e3]
          bg-gradient-to-br
          from-white
          via-[#fff8fb]
          to-[#f8f5ff]
          p-5
          shadow-[0_18px_50px_rgba(99,43,75,0.10)]
          sm:p-6
        "
      >
        {/* soft decorative gradients */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-56
            w-56
            rounded-full
            bg-[#f472b6]/14
            blur-3xl
          "
        />
  
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-24
            left-[20%]
            h-48
            w-48
            rounded-full
            bg-[#8b5cf6]/10
            blur-3xl
          "
        />
  
        {/* top accent */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            h-[4px]
            bg-gradient-to-r
            from-[#9d174d]
            via-[#f13873]
            to-[#8b5cf6]
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
          {/* LEFT */}
  
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                relative
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-[18px]
                bg-gradient-to-br
                from-[#9d174d]
                via-[#d6246b]
                to-[#f13873]
                text-white
                shadow-[0_12px_28px_rgba(241,56,115,0.24)]
              "
            >
              <Brain size={22} />
  
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-3.5
                  w-3.5
                  rounded-full
                  border-2
                  border-white
                  bg-[#8b5cf6]
                "
              />
            </div>
  
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.19em]
                  text-[#f13873]
                "
              >
                Selected Quiz
              </p>
  
              <h3
                className="
                  mt-1
                  text-[22px]
                  font-black
                  tracking-tight
                  text-[#28152f]
                  sm:text-[24px]
                "
              >
                {quiz?.name}
              </h3>
  
              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    bg-[#fff0f6]
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-[#b4235f]
                  "
                >
                  {totalQuestions} Questions
                </span>
  
                <span
                  className="
                    rounded-full
                    bg-[#f3f0ff]
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-[#6d28d9]
                  "
                >
                  {questionsPerPage} per page
                </span>
              </div>
            </div>
          </div>
  
          {/* STATS */}
  
          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-3
            "
          >
            <StatBox
              label="Answered"
              value={`${answeredCount}/${totalQuestions}`}
              icon={CircleHelp}
              type="answered"
            />
  
            <StatBox
              label="Correct"
              value={correctCount}
              icon={CheckCircle2}
              type="correct"
            />
  
            <StatBox
              label="Progress"
              value={`${progress}%`}
              icon={Trophy}
              type="progress"
            />
          </div>
        </div>
  
        {/* PROGRESS AREA */}
  
        <div
          className="
            relative
            z-10
            mt-6
            rounded-[18px]
            border
            border-[#eadde6]
            bg-white/80
            p-4
            shadow-sm
            backdrop-blur-sm
          "
        >
          <div
            className="
              mb-2
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-[#6b5260]
              "
            >
              Quiz Progress
            </span>
  
            <span
              className="
                text-[11px]
                font-black
                text-[#a61e52]
              "
            >
              {progress}%
            </span>
          </div>
  
          <div
            className="
              h-2.5
              overflow-hidden
              rounded-full
              bg-[#f1e9ef]
            "
          >
            <div
              style={{
                width: `${progress}%`,
              }}
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-purple-400
                via-mediumBlue
                to-mediumBlue
                shadow-[0_0_12px_rgba(241,56,115,0.28)]
                transition-all
                duration-500
              "
            />
          </div>
        </div>
      </section>
    );
  }
  
  function StatBox({
    label,
    value,
    icon: Icon,
    type,
  }) {
    const style =
      statStyles[type];
  
    return (
      <div
        className={`
          min-w-[120px]
          rounded-[18px]
          border
          bg-gradient-to-br
          ${style.box}
          ${style.border}
          p-3.5
          shadow-[0_8px_22px_rgba(15,23,42,0.05)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
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
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              ${style.icon}
            `}
          >
            <Icon size={15} />
          </div>
  
          <div>
            <p
              className={`
                text-[8px]
                font-black
                uppercase
                tracking-[0.09em]
                ${style.label}
              `}
            >
              {label}
            </p>
  
            <p
              className={`
                mt-1
                text-[16px]
                font-black
                ${style.value}
              `}
            >
              {value}
            </p>
          </div>
        </div>
      </div>
    );
  }