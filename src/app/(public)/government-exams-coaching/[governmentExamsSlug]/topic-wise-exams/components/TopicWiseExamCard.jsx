import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

import {
  createSlug,
} from "@/lib/slugHelper";

export default function TopicWiseExamCard({
  item,
  governmentExamsSlug,
  examName,
}) {
  if (
    !item?.id ||
    !governmentExamsSlug
  ) {
    return null;
  }

  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    item?.subject ||
    "Topic";

  const slug =
    createSlug(title);

  /* =======================================================
     DYNAMIC URL

     kerala-psc
     ->
     /government-exams-coaching/kerala-psc/topic-wise-exams/test/...

     rrb-ssc
     ->
     /government-exams-coaching/rrb-ssc/topic-wise-exams/test/...
  ======================================================= */

  const href =
    `/government-exams-coaching/${governmentExamsSlug}` +
    `/topic-wise-exams/test/${slug}`;

  /* =======================================================
     DYNAMIC EXAM NAME
  ======================================================= */

  const displayExamName =
    examName ||
    "Government Exam";

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        min-h-[320px]
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_12px_35px_rgba(15,23,42,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-slate-300
        hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]
      "
    >
      {/* ===================================================
          DECORATIVE GLOW
      ==================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-violet-100
          opacity-60
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          flex
          h-full
          flex-col
        "
      >
        {/* =================================================
            TOP
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              bg-gray-100
              text-mediumBlue
            "
          >
            <BookOpen
              size={23}
              strokeWidth={2.2}
            />
          </div>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-amber-200
              bg-amber-50
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-amber-700
            "
          >
            <Sparkles
              size={11}
            />

            Topic Wise
          </span>
        </div>

        {/* =================================================
            EXAM NAME
        ================================================== */}

        <p
          className="
            mt-6
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-emerald-600
          "
        >
          {displayExamName} Practice
        </p>

        {/* =================================================
            TITLE
        ================================================== */}

        <h3
          className="
            mt-2
            text-[20px]
            font-black
            leading-7
            text-slate-900
          "
        >
          {title}
        </h3>

        {/* =================================================
            MALAYALAM TITLE
        ================================================== */}

        {item?.subject_mal && (
          <p
            className="
              mt-2
              text-[13px]
              leading-6
              text-slate-500
            "
          >
            {item.subject_mal}
          </p>
        )}

        <div
          className="
            mt-5
            h-px
            bg-slate-100
          "
        />

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        <p
          className="
            mt-5
            text-[12px]
            leading-6
            text-slate-500
          "
        >
          Practice focused questions
          from this topic and strengthen
          your {displayExamName} preparation.
        </p>

        {/* =================================================
            LINK
        ================================================== */}

        <Link
          href={href}
          className="
            mt-auto
            pt-6
          "
        >
          <span
            className="
              inline-flex
              w-full
              items-center
              justify-between
              rounded-[16px]
              bg-mediumBlue
              px-5
              py-2
              text-[12px]
              font-bold
              text-white
              transition-all
              duration-300
              group-hover:bg-[#164fa5]
            "
          >
            Start Practice

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white/15
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              <ArrowRight
                size={15}
              />
            </span>
          </span>
        </Link>
      </div>
    </article>
  );
}