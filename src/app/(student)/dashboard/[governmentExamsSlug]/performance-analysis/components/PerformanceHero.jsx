import {
    Activity,
    Sparkles,
} from "lucide-react";

export default function PerformanceHero({
    examName,
}) {
    return (
        <section
            className="
        relative
        overflow-hidden
        rounded-[30px]

        bg-gradient-to-r
        from-[#061b4d]
        via-[#075fc8]
        to-[#7137eb]

        px-6
        py-7
        text-white

        shadow-[0_20px_55px_rgba(7,95,200,0.20)]

        sm:px-8
      "
        >
            <div
                className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.16]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:31px_31px]
        "
            />

            <div
                className="
          pointer-events-none
          absolute
          -right-24
          -top-28

          h-[330px]
          w-[330px]

          rounded-full
          bg-cyan-300/20
          blur-[90px]
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

              backdrop-blur-md
            "
                    >
                        <Sparkles
                            size={11}
                        />

                        <span
                            className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-blue-100
              "
                        >
                            {examName} Dashboard
                        </span>
                    </div>

                    <h1
                        className="
              mt-4

              text-[29px]
              font-black
              tracking-tight

              sm:text-[34px]
            "
                    >
                        Performance Analysis
                    </h1>

                    <p
                        className="
              mt-2
              max-w-[620px]

              text-[12px]
              leading-6

              text-white/70
            "
                    >
                        Track attempts,
                        accuracy and scoring
                        progress from your saved
                        exam activity.
                    </p>
                </div>

                <div
                    className="
            hidden

            h-[90px]
            w-[90px]

            items-center
            justify-center

            rounded-[26px]

            border
            border-white/15

            bg-white/10

            backdrop-blur-xl

            lg:flex
          "
                >
                    <Activity
                        size={36}
                        strokeWidth={1.7}
                    />
                </div>
            </div>
        </section>
    );
}