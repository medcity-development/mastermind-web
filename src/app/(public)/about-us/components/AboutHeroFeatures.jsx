import {
    BadgeCheck,
    BookOpenCheck,
    Target,
  } from "lucide-react";
  
  const features = [
    {
      icon: BadgeCheck,
      text: "Expert Guidance",
    },
    {
      icon: BookOpenCheck,
      text: "Quality Learning",
    },
    {
      icon: Target,
      text: "Focused Practice",
    },
  ];
  
  export default function AboutHeroFeatures() {
    return (
      <div
        className="
          mx-auto
          mt-4
          grid
          max-w-[520px]
          grid-cols-1
          gap-2
          sm:grid-cols-3
        "
      >
        {features.map((feature) => {
          const Icon = feature.icon;
  
          return (
            <div
              key={feature.text}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[#164fa5]/10
                bg-white/95
                px-3
                py-2
                text-[8px]
                font-semibold
                text-[#22335d]
                shadow-[0_7px_18px_rgba(22,79,165,0.08)]
                backdrop-blur
                sm:text-[9px]
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#eaf5ff]
                  text-[#017cc0]
                "
              >
                <Icon size={12} />
              </span>
  
              {feature.text}
            </div>
          );
        })}
      </div>
    );
  }