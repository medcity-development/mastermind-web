import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

const cardThemes = {
  "current-affairs": {
    card:
      "border-[#f8cfe5] bg-gradient-to-br from-[#fff7fb] via-[#fffafd] to-[#ffeef7]",
    glow:
      "bg-[#f13873]/10",
    bubble:
      "bg-[#f13873]/10",
    arrow:
      "bg-[#ffe0ef] text-[#e91e73]",
  },

  "mock-tests": {
    card:
      "border-[#cee5fb] bg-gradient-to-br from-[#f7fbff] via-white to-[#eaf5ff]",
    glow:
      "bg-[#1688ed]/10",
    bubble:
      "bg-[#1688ed]/10",
    arrow:
      "bg-[#dcefff] text-[#087bea]",
  },

  "previous-questions": {
    card:
      "border-[#ccefe1] bg-gradient-to-br from-[#f6fffb] via-white to-[#e8fbf3]",
    glow:
      "bg-[#10b981]/10",
    bubble:
      "bg-[#10b981]/10",
    arrow:
      "bg-[#dcf8ec] text-[#0dac77]",
  },

  "exam-syllabus": {
    card:
      "border-[#e1d5fc] bg-gradient-to-br from-[#fbf9ff] via-white to-[#f0ebff]",
    glow:
      "bg-[#7c3aed]/10",
    bubble:
      "bg-[#7c3aed]/10",
    arrow:
      "bg-[#ece5ff] text-[#6935e8]",
  },

  "scert-tests": {
    card:
      "border-[#f8dfc7] bg-gradient-to-br from-[#fffaf5] via-white to-[#fff0e1]",
    glow:
      "bg-[#f97316]/10",
    bubble:
      "bg-[#f97316]/10",
    arrow:
      "bg-[#ffead8] text-[#f26522]",
  },

  notifications: {
    card:
      "border-[#cfe7fb] bg-gradient-to-br from-[#f6fbff] via-white to-[#eaf7ff]",
    glow:
      "bg-[#0ea5e9]/10",
    bubble:
      "bg-[#0ea5e9]/10",
    arrow:
      "bg-[#dff2ff] text-[#1688ed]",
  },

  "psc-bulletin-ca": {
    card:
      "border-[#f7d2e5] bg-gradient-to-br from-[#fff7fb] via-white to-[#ffedf6]",
    glow:
      "bg-[#ec4899]/10",
    bubble:
      "bg-[#ec4899]/10",
    arrow:
      "bg-[#ffe0f0] text-[#ec2384]",
  },

  "topic-wise-exams": {
    card:
      "border-[#f7d3d8] bg-gradient-to-br from-[#fff8f8] via-white to-[#ffeded]",
    glow:
      "bg-[#ef4444]/10",
    bubble:
      "bg-[#ef4444]/10",
    arrow:
      "bg-[#ffe0e3] text-[#ef315f]",
  },

  "statement-type-exams": {
    card:
      "border-[#ded4fb] bg-gradient-to-br from-[#faf8ff] via-white to-[#efeaff]",
    glow:
      "bg-[#7c3aed]/10",
    bubble:
      "bg-[#7c3aed]/10",
    arrow:
      "bg-[#ebe5ff] text-[#6437df]",
  },

  "study-materials": {
    card:
      "border-[#f9d1dd] bg-gradient-to-br from-[#fff8fa] via-white to-[#ffeef3]",
    glow:
      "bg-[#f43f5e]/10",
    bubble:
      "bg-[#f43f5e]/10",
    arrow:
      "bg-[#ffe1e8] text-[#ef315f]",
  },

  "current-affairs-quiz": {
    card:
      "border-[#f7e4b9] bg-gradient-to-br from-[#fffdf7] via-white to-[#fff6dc]",
    glow:
      "bg-[#f59e0b]/10",
    bubble:
      "bg-[#f59e0b]/10",
    arrow:
      "bg-[#fff0c9] text-[#e99a00]",
  },

  "ai-videos": {
    card:
      "border-[#cfe6fb] bg-gradient-to-br from-[#f6fbff] via-white to-[#eaf6ff]",
    glow:
      "bg-[#1688ed]/10",
    bubble:
      "bg-[#1688ed]/10",
    arrow:
      "bg-[#ddecff] text-[#126fd4]",
  },
};

const defaultTheme = {
  card:
    "border-[#dce8f4] bg-gradient-to-br from-white via-[#fbfdff] to-[#f2f8ff]",
  glow:
    "bg-[#00b5e8]/10",
  bubble:
    "bg-[#00b5e8]/10",
  arrow:
    "bg-[#e3f5ff] text-[#017cc0]",
};

export default function LearningToolCard({
  item,
}) {
  if (!item) {
    return null;
  }

  const Icon =
    item.icon;

  const theme =
    cardThemes[
      item.route
    ] || defaultTheme;

  const content = (
    <>
      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-9
          -top-7
          h-20
          w-20
          rounded-full
          transition-all
          duration-500
          group-hover:scale-125

          ${theme.bubble}
        `}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-5
          top-4
          grid
          grid-cols-4
          gap-[4px]
          opacity-30
        "
      >
        {Array.from({
          length: 12,
        }).map(
          (_, index) => (
            <span
              key={index}
              className={`
                h-[3px]
                w-[3px]
                rounded-full

                ${
                  item.iconColor?.replace(
                    "text-",
                    "bg-"
                  ) ||
                  "bg-[#017cc0]"
                }
              `}
            />
          )
        )}
      </div>

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -left-10
          -top-12
          h-32
          w-32
          rounded-full
          blur-3xl
          transition-transform
          duration-500
          group-hover:scale-125

          ${theme.glow}
        `}
      />

      {Icon && (
        <div
          className={`
            relative
            z-10
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            shadow-[0_8px_20px_rgba(15,58,110,0.06)]
            ring-1
            ring-white/70
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:scale-105

            ${
              item.iconBg ||
              "bg-[#e3f5ff]"
            }

            ${
              item.iconColor ||
              "text-[#017cc0]"
            }
          `}
        >
          <Icon
            className="
              h-[23px]
              w-[23px]
            "
            strokeWidth={2.3}
          />
        </div>
      )}

      <h3
        className="
          relative
          z-10
          mt-3
          max-w-[90%]
          text-[12px]
          font-bold
          leading-[1.2]
          text-[#0b216c]
          sm:text-[12px]
          xl:text-[13px]
        "
      >
        {item.title}
      </h3>

      <div
        className="
          relative
          z-10
          mt-auto
          flex
          w-full
          items-end
          justify-between
          gap-2
          pt-1.5
        "
      >
        <p
          className="
            min-w-0
            text-[9px]
            leading-4
            text-[#647899]
            sm:text-[10px]
          "
        >
          {item.subtitle}
        </p>

        <span
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:scale-105

            ${theme.arrow}
          `}
        >
          <ArrowRight
            size={15}
            strokeWidth={2.4}
          />
        </span>
      </div>
    </>
  );

  const className = `
    group
    relative
    flex
    min-h-[142px]
    w-full
    flex-col
    overflow-hidden
    rounded-[20px]
    border
    px-4
    py-4
    text-left
    shadow-[0_8px_24px_rgba(15,58,110,0.05)]
    transition-all
    duration-300
    hover:-translate-y-1.5
    hover:shadow-[0_18px_38px_rgba(15,58,110,0.12)]
    sm:min-h-[148px]
    lg:min-h-[140px]

    ${theme.card}
  `;

  if (!item.href) {
    return (
      <article
        className={`
          ${className}
          pointer-events-none
          opacity-70
        `}
      >
        {content}
      </article>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={`Open ${item.title}`}
      className={className}
    >
      {content}
    </Link>
  );
}
