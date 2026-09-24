import {
    Star,
    Users,
  } from "lucide-react";
  
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Students Learning",
      iconBg: "bg-[#dff1ff]",
      iconColor: "text-[#087bea]",
    },
    {
      icon: Star,
      value: "4.8/5",
      label: "App Rating",
      iconBg: "bg-[#fff0dc]",
      iconColor: "text-[#f59e0b]",
    },
  ];
  
  export default function RecommendedStats() {
    return (
      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        {stats.map((item) => {
          const Icon = item.icon;
  
          return (
            <article
              key={item.label}
              data-aos="fade-left"
              className="
                flex
                min-h-[130px]
                flex-col
                items-center
                justify-center
                rounded-[20px]
                border
                border-[#e1ebf5]
                bg-gradient-to-br
                from-white
                to-[#f2f8fd]
                px-3
                text-center
                shadow-[0_8px_22px_rgba(15,58,110,0.05)]
              "
            >
              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
  
                  ${item.iconBg}
                  ${item.iconColor}
                `}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2.2}
                />
              </div>
  
              <p
                className="
                  mt-2
                  text-xl
                  font-black
                  text-[#0b216c]
                "
              >
                {item.value}
              </p>
  
              <p
                className="
                  mt-1
                  text-[10px]
                  text-[#687b9d]
                "
              >
                {item.label}
              </p>
            </article>
          );
        })}
      </div>
    );
  }