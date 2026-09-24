import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  FileQuestion,
  ListChecks,
  MonitorPlay,
  Target,
} from "lucide-react";

const benefitIcons = [
  CalendarCheck2,
  MonitorPlay,
  FileQuestion,
  ClipboardCheck,
  Target,
  ListChecks,
];

export default function PackageIncludesSection({
  features = [],
}) {
  const featureList =
    Array.isArray(features)
      ? features
      : [];

  if (!featureList.length) {
    return null;
  }

  return (
    <section
      className="
        relative
        mt-8
        overflow-hidden
        rounded-[28px]
        border
        border-[#dfe9f4]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f7fbff]
        p-6
        shadow-[0_18px_45px_rgba(15,58,110,0.07)]
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
          opacity-[0.025]
          [background-image:linear-gradient(#164fa5_1px,transparent_1px),linear-gradient(90deg,#164fa5_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      <div className="relative z-10">
        {/* HEADER */}

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
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-[16px]
              bg-[#fff0f5]
              text-[#f13873]
            "
          >
            <Target
              size={23}
            />
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#f13873]
              "
            >
              Package Benefits
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
                tracking-[-0.03em]
                text-[#0b216c]
              "
            >
              What's Included
            </h2>

            <p
              className="
                mt-1
                text-[12px]
                text-slate-500
              "
            >
              Everything included
              with this package.
            </p>
          </div>
        </div>

        {/* BENEFITS */}

        <div
          className="
            mt-7
            grid
            gap-4
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {featureList.map(
            (
              feature,
              index
            ) => {
              const Icon =
                benefitIcons[
                  index %
                    benefitIcons.length
                ];

              return (
                <article
                  key={`${feature}-${index}`}
                  className="
                    group
                    flex
                    items-start
                    gap-4
                    rounded-[20px]
                    border
                    border-[#e1eaf5]
                    bg-white
                    p-5
                    shadow-[0_8px_24px_rgba(15,58,110,0.04)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#c7dcef]
                    hover:shadow-[0_15px_35px_rgba(15,58,110,0.08)]
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-[15px]
                      bg-[#e9f7ff]
                      text-[#1688dd]
                    "
                  >
                    <Icon
                      size={20}
                    />
                  </div>

                  <p
                    className="
                      min-w-0
                      flex-1
                      text-[13px]
                      font-bold
                      leading-6
                      text-[#233c63]
                    "
                  >
                    {feature}
                  </p>

                  <CheckCircle2
                    size={18}
                    className="
                      mt-1
                      shrink-0
                      text-[#19a463]
                    "
                  />
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}