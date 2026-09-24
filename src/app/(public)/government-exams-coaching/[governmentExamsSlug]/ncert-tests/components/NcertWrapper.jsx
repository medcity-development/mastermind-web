import {
  BookOpen,
  Clock3,
  Sparkles,
} from "lucide-react";

export default function NcertWrapper({
  examName = "Government Exams",
}) {
  return (
    <section
      className="
        flex
        min-h-[calc(100vh-72px)]
        w-full
        items-center
        justify-center
        px-4
        py-10
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[720px]
          overflow-hidden
          rounded-[28px]
          border
          border-[#dce8f5]
          bg-white
          px-6
          py-12
          text-center
          shadow-[0_15px_45px_rgba(15,58,110,0.07)]
          sm:px-10
          sm:py-14
        "
      >
        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-20
            -top-20
            h-[220px]
            w-[220px]
            rounded-full
            bg-[#38bdf8]/10
            blur-[70px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-24
            -right-20
            h-[240px]
            w-[240px]
            rounded-full
            bg-[#8b5cf6]/10
            blur-[80px]
          "
        />

        {/* LIGHT GRID */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]
            [background-size:28px_28px]
          "
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-10
          "
        >
          {/* ICON */}

          <div
            className="
              mx-auto
              flex
              h-[82px]
              w-[82px]
              items-center
              justify-center
              rounded-[24px]
              bg-gradient-to-br
              from-[#e5f5ff]
              to-[#eeeaff]
              shadow-[0_10px_30px_rgba(22,79,165,0.10)]
            "
          >
            <BookOpen
              size={36}
              strokeWidth={1.8}
              className="
                text-[#164fa5]
              "
            />
          </div>

          {/* STATUS */}

          <div
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#d9e8f7]
              bg-[#f3f9ff]
              px-4
              py-2
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-[#075fc8]
            "
          >
            <Clock3
              size={14}
            />

            Available Soon
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-5
              text-[26px]
              font-extrabold
              tracking-[-0.03em]
              text-[#0b216c]
              sm:text-[32px]
            "
          >
            NCERT Tests
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-3
              max-w-[520px]
              text-[14px]
              leading-7
              text-slate-500
              sm:text-[15px]
            "
          >
            NCERT tests and learning
            resources for{" "}
            <span
              className="
                font-semibold
                text-slate-700
              "
            >
              {examName}
            </span>{" "}
            are being prepared and
            will be available soon.
          </p>

          {/* MESSAGE */}

          <div
            className="
              mx-auto
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#eef8ff]
              to-[#f3efff]
              px-5
              py-3
              text-[13px]
              font-semibold
              text-[#324d78]
            "
          >
            <Sparkles
              size={16}
              className="
                text-[#7c5ce7]
              "
            />

            New resources are on
            the way
          </div>
        </div>
      </div>
    </section>
  );
}