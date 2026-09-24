import Image from "next/image";

import {
  Crown,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function PackageHero({
  title,
  tag,
  description,
  imageUrl,
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px] mt-20
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_18px_50px_rgba(22,79,165,0.08)]
      "
    >
      <div
        className="
          grid
          min-h-[340px]
          grid-cols-1
          lg:grid-cols-[1.05fr_0.95fr]
        "
      >
        {/* LEFT */}
        <div
          className="
            relative
            flex
            flex-col
            justify-center
            px-6
            py-8
            sm:px-8
            lg:px-10
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-20
              -top-20
              h-52
              w-52
              rounded-full
              bg-[#017cc0]/7
              blur-3xl
            "
          />

          <div className="relative z-10">
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
                tracking-[0.1em]
                text-amber-700
              "
            >
              <Crown size={11} />

              Premium Plan
            </span>

            <p
              className="
                mt-5
                flex
                items-center
                gap-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-[#017cc0]
              "
            >
              <GraduationCap
                size={14}
              />

              Kerala PSC
            </p>

            <h1
              className="
                mt-2
                max-w-xl
                text-3xl
                font-black
                leading-tight
                text-[#05176A]
                sm:text-4xl
              "
            >
              {title}
            </h1>

            {tag && (
              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-[12px]
                  bg-[#eef6ff]
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-[#164fa5]
                "
              >
                <Sparkles
                  size={13}
                />

                {tag}
              </div>
            )}

            {description && (
              <p
                className="
                  mt-5
                  max-w-[650px]
                  text-[12px]
                  font-medium
                  leading-6
                  text-slate-600
                  sm:text-[13px]
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="
            relative
            flex
            min-h-[280px]
            items-center
            justify-center
            overflow-hidden
            border-t
            border-[#e5edf8]
            bg-gradient-to-br
            from-[#eaf4ff]
            via-[#f5f9ff]
            to-[#eef2ff]
            p-4
            lg:min-h-[340px]
            lg:border-l
            lg:border-t-0
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.05]
              [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]
              [background-size:28px_28px]
            "
          />

          {imageUrl ? (
            <div
              className="
                relative
                z-10
                h-full
                min-h-[250px]
                w-full
                overflow-hidden
                rounded-[20px]
                bg-white
                shadow-[0_14px_35px_rgba(15,35,100,0.10)]
              "
            >
              <Image
                src={imageUrl}
                alt={
                  title ||
                  "Premium package"
                }
                fill
                sizes="
                  (max-width: 1024px) 100vw,
                  48vw
                "
                className="
                  object-contain
                  object-center
                  p-1
                "
              />
            </div>
          ) : (
            <div
              className="
                relative
                z-10
                flex
                h-[250px]
                w-full
                items-center
                justify-center
                rounded-[20px]
                bg-white
                text-[#017cc0]
              "
            >
              <Crown size={50} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}