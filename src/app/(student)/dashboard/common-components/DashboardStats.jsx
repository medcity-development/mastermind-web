import {
    BookOpenCheck,
    GraduationCap,
    Radio,
    Users,
  } from "lucide-react";
  
  export default function DashboardStats({
    config,
  }) {
    const stats = [
      {
        icon: Users,
        value:
          config?.slug === "rrb-ssc"
            ? "50K+"
            : "100K+",
        label: "Learners",
        card:
          "from-[#fff2f6] to-[#fff8fa]",
        iconBg:
          "from-[#ff5d8f] to-[#ff7da4]",
      },
      {
        icon: BookOpenCheck,
        value: "500+",
        label: "Video Lectures",
        card:
          "from-[#eef6ff] to-[#f8fbff]",
        iconBg:
          "from-[#2486f8] to-[#4ca4ff]",
      },
      {
        icon: Radio,
        value: "Daily",
        label: "Live Classes",
        card:
          "from-[#effcf5] to-[#f8fffb]",
        iconBg:
          "from-[#23bd7b] to-[#4cd99c]",
      },
      {
        icon: GraduationCap,
        value: "Expert",
        label: "Faculty Support",
        card:
          "from-[#f5f0ff] to-[#fbf9ff]",
        iconBg:
          "from-[#8055ef] to-[#9c71ff]",
      },
    ];
  
    return (
      <section
        className="
          grid
          grid-cols-2
          gap-3
          xl:grid-cols-4 my-5
        "
      >
        {stats.map((item) => {
          const Icon =
            item.icon;
  
          return (
            <div
              key={item.label}
              className={`
                flex
                min-h-[92px]
                items-center
                gap-4
                rounded-[19px]
                border
                border-white
                bg-gradient-to-br
                p-4
                shadow-[0_12px_35px_rgba(15,23,42,0.05)]
  
                ${item.card}
              `}
            >
              <span
                className={`
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-gradient-to-br
                  text-white
                  shadow-sm
  
                  ${item.iconBg}
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={1.9}
                />
              </span>
  
              <div>
                <p
                  className="
                    text-[18px]
                    font-extrabold
                    leading-none
                    text-[#071b59]
                  "
                >
                  {item.value}
                </p>
  
                <p
                  className="
                    mt-2
                    text-[9px]
                    font-medium
                    text-slate-500
                  "
                >
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    );
  }