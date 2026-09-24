import {
    GraduationCap,
    Heart,
    Trophy,
    Users,
  } from "lucide-react";
  
  const stats = [
    {
      icon: GraduationCap,
      value: "50,000+",
      label: "Happy Learners",
      tone: "blue",
    },
    {
      icon: Users,
      value: "10,000+",
      label: "Selections",
      tone: "pink",
    },
    {
      icon: Trophy,
      value: "4.9/5",
      label: "Average Rating",
      tone: "yellow",
    },
    {
      icon: Heart,
      value: "90%",
      label: "Recommend Us",
      tone: "pink",
    },
  ];
  
  const tones = {
    blue: {
      wrap: "bg-[#e7f4ff]",
      icon: "text-[#1396ef]",
    },
  
    pink: {
      wrap: "bg-[#ffe6f1]",
      icon: "text-[#ef3090]",
    },
  
    yellow: {
      wrap: "bg-[#fff2d5]",
      icon: "text-[#f2a900]",
    },
  };
  
  export default function TestimonialsStats() {
    return (
      <div
        className="
          relative
          z-10
          mx-auto
          mt-12
          max-w-[1350px]
          overflow-hidden
          rounded-[24px]
          border
          border-white/90
          bg-white/85
          px-5
          py-5
          shadow-[0_16px_45px_rgba(8,31,92,0.07)]
          backdrop-blur-xl
          sm:px-7
          lg:mt-14
          lg:px-9
        " data-aos="fade-right"
      >
        <div
          className="
            grid
            grid-cols-2
            gap-y-6
            sm:grid-cols-4
            lg:gap-0
          "
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const tone = tones[stat.tone];
  
            return (
              <div
                key={stat.label}
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  gap-4
                  px-3
                  lg:px-6
                "
              >
                {index !== stats.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      right-0
                      top-1/2
                      hidden
                      h-12
                      w-px
                      -translate-y-1/2
                      bg-[#164fa5]/10
                      sm:block
                    "
                  />
                )}
  
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    ${tone.wrap}
                  `}
                >
                  <Icon
                    size={21}
                    strokeWidth={2}
                    className={tone.icon}
                  />
                </div>
  
                <div>
                  <p
                    className="
                      text-[21px]
                      font-black
                      leading-none
                      tracking-[-0.03em]
                      text-[#086ce0]
                      sm:text-[23px]
                    "
                  >
                    {stat.value}
                  </p>
  
                  <p
                    className="
                      mt-1.5
                      text-[10px]
                      font-medium
                      text-[#53647f]
                      sm:text-[11px]
                    "
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }