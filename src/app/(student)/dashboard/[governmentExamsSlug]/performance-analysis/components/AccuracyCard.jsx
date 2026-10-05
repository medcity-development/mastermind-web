export default function AccuracyCard({
    icon: Icon,
    eyebrow,
    label,
    value = 0,
    total = 0,
    type = "correct",
}) {
    const percentage =
        total > 0
            ? Math.round(
                (value /
                    total) *
                100
            )
            : 0;

    const correct =
        type ===
        "correct";

    return (
        <article
            className="
        relative
        overflow-hidden

        rounded-[26px]

        border
        border-[#dce8f7]

        bg-white

        p-5

        shadow-[0_12px_35px_rgba(15,23,42,0.05)]
      "
        >
            <div
                className="
          pointer-events-none
          absolute
          inset-0

          opacity-[0.25]

          [background-image:linear-gradient(to_right,#e6edf7_1px,transparent_1px),linear-gradient(to_bottom,#e6edf7_1px,transparent_1px)]
          [background-size:26px_26px]
        "
            />

            <div
                className="
          relative
          z-10

          flex
          items-center
          justify-between
          gap-4
        "
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
              h-11
              w-11
              items-center
              justify-center

              rounded-[14px]

              ${correct
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-500"
                            }
            `}
                    >
                        <Icon
                            size={19}
                        />
                    </div>

                    <div>
                        <p
                            className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.13em]
                text-slate-400
              "
                        >
                            {eyebrow}
                        </p>

                        <h3
                            className="
                mt-1
                text-[15px]
                font-black
                text-[#071f55]
              "
                        >
                            {label}
                        </h3>
                    </div>
                </div>

                <div
                    className="
            text-right
          "
                >
                    <p
                        className="
              text-[23px]
              font-black
              text-[#071f55]
            "
                    >
                        {value}
                    </p>

                    <p
                        className="
              text-[9px]
              font-bold
              text-slate-400
            "
                    >
                        {percentage}%
                    </p>
                </div>
            </div>

            <div
                className="
          relative
          z-10

          mt-5
          h-2

          overflow-hidden

          rounded-full

          bg-slate-100
        "
            >
                <div
                    className={`
            h-full
            rounded-full

            ${correct
                            ? "bg-emerald-500"
                            : "bg-red-400"
                        }
          `}
                    style={{
                        width:
                            `${percentage}%`,
                    }}
                />
            </div>
        </article>
    );
}