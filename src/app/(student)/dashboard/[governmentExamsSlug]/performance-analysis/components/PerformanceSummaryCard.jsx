export default function PerformanceSummaryCard({
    icon: Icon,
    label,
    value,
    description,
    tone = "",
}) {
    return (
        <article
            className="
        group
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-[#dce8f7]

        bg-white

        p-5

        shadow-[0_12px_32px_rgba(15,23,42,0.05)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]
      "
        >
            <div
                className="
          pointer-events-none
          absolute
          inset-0

          opacity-[0.28]

          [background-image:linear-gradient(to_right,#e7eef7_1px,transparent_1px),linear-gradient(to_bottom,#e7eef7_1px,transparent_1px)]
          [background-size:24px_24px]
        "
            />

            <div
                className="
          relative
          z-10

          flex
          items-center
          gap-4
        "
            >
                <div
                    className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-[15px]
            ${tone}
          `}
                >
                    <Icon
                        size={20}
                    />
                </div>

                <div>
                    <p
                        className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.13em]
              text-slate-400
            "
                    >
                        {label}
                    </p>

                    <p
                        className="
              mt-1

              text-[25px]
              font-black
              tracking-tight

              text-[#071f55]
            "
                    >
                        {value}
                    </p>

                    <p
                        className="
              mt-1
              text-[9px]
              text-slate-400
            "
                    >
                        {description}
                    </p>
                </div>
            </div>
        </article>
    );
}