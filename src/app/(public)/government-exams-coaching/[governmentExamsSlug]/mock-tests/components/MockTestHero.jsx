import {
  Brain,
  Clock3,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

export default function MockTestHero({
  examName,
  heroContent,
}) {
  const content =
    heroContent || {
      eyebrow:
        `${examName} Practice Zone`,

      headingPrefix:
        "Practice Smarter With",

      headingHighlight:
        `${examName} Mock Tests`,

      description:
        `Practice exam-focused mock tests for ${examName}.`,

      panelEyebrow:
        "Ready to Practice?",

      panelTitle:
        "Start Your Practice",

      panelDescription:
        "Choose an exam below and start practicing.",

      featureText:
        "Practice consistently and track your performance.",
    };

  return (
    <section
      className="
        relative
        mt-20
        overflow-hidden
        rounded-[24px]
        px-6
        py-5
        text-white
        shadow-[0_20px_50px_rgba(40,64,160,0.22)]
        sm:px-7
        sm:py-6
        lg:px-8
        lg:py-6
      "
      style={{
        backgroundColor:
          "#2456b8",

        backgroundImage:
          "linear-gradient(115deg, #2456b8 0%, #3478ca 32%, #7652b1 66%, #c94f91 100%)",
      }}
    >
      {/* =========================================
          GRID
      ========================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.07]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* =========================================
          SUBTLE DARK OVERLAY
      ========================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-black/[0.04]
        "
      />

      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-10
          grid
          items-center
          gap-6
          lg:grid-cols-[minmax(0,1fr)_320px]
        "
      >
        {/* =====================================
            LEFT
        ====================================== */}

        <div>
          {/* EYEBROW */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-white/10
              px-3
              py-1.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.14em]
              text-white
              backdrop-blur-sm
            "
          >
            <Sparkles
              size={11}
              className="text-pink-100"
            />

            {content.eyebrow}
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-3
              max-w-[720px]
              text-[27px]
              font-black
              leading-[1.08]
              tracking-[-0.035em]
              text-white
              sm:text-[31px]
              lg:text-[34px]
            "
          >
            {content.headingPrefix}

            <span
              className="
                ml-2
                text-[#ffe0ef]
              "
            >
              {
                content.headingHighlight
              }
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-2.5
              max-w-[700px]
              text-[11px]
              leading-5
              text-white/80
              sm:text-[12px]
            "
          >
            {content.description}
          </p>

          {/* FEATURES */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            <FeatureBadge
              icon={Target}
              text="Exam Focused"
            />

            <FeatureBadge
              icon={Clock3}
              text="Timed Practice"
            />

            <FeatureBadge
              icon={Trophy}
              text="Instant Results"
            />
          </div>
        </div>

        {/* =====================================
            RIGHT PANEL
        ====================================== */}

        <div
          className="
            rounded-[18px]
            border
            border-white/20
            bg-[#152f73]/25
            p-4
            shadow-[0_12px_30px_rgba(25,35,90,0.15)]
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-pink-100
                "
              >
                {
                  content.panelEyebrow
                }
              </p>

              <h2
                className="
                  mt-1
                  text-[17px]
                  font-black
                  text-white
                "
              >
                {
                  content.panelTitle
                }
              </h2>

              <p
                className="
                  mt-1
                  text-[9px]
                  leading-4
                  text-white/70
                "
              >
                {
                  content.panelDescription
                }
              </p>
            </div>

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                border
                border-white/15
                bg-white/10
                text-white
              "
            >
              <Brain size={18} />
            </div>
          </div>

          {/* INFO */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-3
              rounded-[11px]
              border
              border-white/10
              bg-black/10
              px-3
              py-2.5
            "
          >
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-[8px]
                bg-white/10
                text-pink-100
              "
            >
              <Trophy size={13} />
            </div>

            <p
              className="
                text-[8px]
                font-semibold
                leading-4
                text-white/75
              "
            >
              {content.featureText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE BADGE
========================================================= */

function FeatureBadge({
  icon: Icon,
  text,
}) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/15
        bg-white/10
        px-3
        py-1.5
        text-[8px]
        font-bold
        text-white/90
      "
    >
      <Icon size={11} />

      {text}
    </div>
  );
}