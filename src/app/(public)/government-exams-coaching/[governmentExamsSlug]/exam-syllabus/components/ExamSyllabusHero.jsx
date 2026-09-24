import {
  BookOpenCheck,
  FileText,
  SearchCheck,
  Target,
} from "lucide-react";

export default function ExamSyllabusHero({
  examName = "Government Exam",
  shortName = "Exam",
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        bg-gradient-to-r
        from-[#071f55]
        via-[#075fc8]
        to-[#7c3aed]
        px-5
        py-8
        text-white
        shadow-[0_20px_55px_rgba(22,79,165,0.20)]
        sm:px-8
        lg:px-10
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

      {/* GLOWS */}
      <div
        aria-hidden="true"
        className="
          absolute
          -left-20
          -top-20
          h-64
          w-64
          rounded-full
          bg-[#00b5e8]/20
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -right-20
          -top-16
          h-64
          w-64
          rounded-full
          bg-[#e83e8c]/20
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          grid
          gap-7
          lg:grid-cols-[minmax(0,1fr)_auto]
          lg:items-end
        "
      >
        <div>
          {/* BADGE */}
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
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-cyan-100
              backdrop-blur
            "
          >
            <BookOpenCheck
              size={13}
            />

            {shortName} Preparation
          </div>

          {/* TITLE */}
          <h1
            className="
              mt-5
              text-3xl
              font-black
              tracking-[-0.04em]
              sm:text-4xl
              lg:text-[44px]
            "
          >
            {examName}

            <span
              className="
                ml-2
                bg-gradient-to-r
                from-[#67e8f9]
                via-[#c4b5fd]
                to-[#f9a8d4]
                bg-clip-text
                text-transparent
              "
            >
              Exam Syllabus
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-4
              max-w-[720px]
              text-[12px]
              leading-6
              text-white/70
              sm:text-[13px]
            "
          >
            Explore {examName} exam syllabuses and access
            available syllabus PDFs for your exam preparation.
          </p>

          {/* FEATURES */}
          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-2
            "
          >
            <Feature
              icon={FileText}
              label="Official PDFs"
            />

            <Feature
              icon={Target}
              label={`${shortName} Focused`}
            />

            <Feature
              icon={SearchCheck}
              label="Easy Access"
            />
          </div>
        </div>

        {/* RIGHT ICON */}
        <div
          className="
            hidden
            h-24
            w-24
            items-center
            justify-center
            rounded-[26px]
            border
            border-white/15
            bg-white/10
            backdrop-blur
            lg:flex
          "
        >
          <BookOpenCheck
            size={42}
          />
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  label,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-[12px]
        border
        border-white/15
        bg-white/10
        px-3
        py-2
        text-[10px]
        font-semibold
        text-white/85
        backdrop-blur
      "
    >
      <Icon
        size={14}
        className="text-cyan-200"
      />

      {label}
    </div>
  );
}