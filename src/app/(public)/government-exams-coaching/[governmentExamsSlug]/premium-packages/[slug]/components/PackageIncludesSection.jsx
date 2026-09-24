import {
    CheckCircle2,
    Sparkles,
  } from "lucide-react";
  
  export default function PackageIncludesSection({
    features = [],
  }) {
    if (
      !Array.isArray(features) ||
      features.length === 0
    ) {
      return null;
    }
  
    return (
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_10px_30px_rgba(22,79,165,0.05)]
          sm:p-6
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
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-[13px]
              bg-[#eef6ff]
              text-[#017cc0]
            "
          >
            <Sparkles size={17} />
          </div>
  
          <div>
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#017cc0]
              "
            >
              Package Benefits
            </p>
  
            <h2
              className="
                mt-0.5
                text-xl
                font-black
                text-[#05176A]
              "
            >
              What&apos;s Included
            </h2>
          </div>
        </div>
  
        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
          "
        >
          {features.map(
            (feature, index) => (
              <div
                key={`${feature}-${index}`}
                className="
                  flex
                  items-start
                  gap-3
                  rounded-[15px]
                  border
                  border-[#e5edf8]
                  bg-[#f8fbff]
                  px-4
                  py-3.5
                  transition
                  hover:border-[#017cc0]/20
                  hover:bg-[#f3f9ff]
                "
              >
                <div
                  className="
                    mt-0.5
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CheckCircle2
                    size={14}
                  />
                </div>
  
                <p
                  className="
                    text-[11px]
                    font-semibold
                    leading-5
                    text-slate-600
                  "
                >
                  {feature}
                </p>
              </div>
            )
          )}
        </div>
      </section>
    );
  }