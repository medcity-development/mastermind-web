import {
    BookOpen,
    GraduationCap,
    Users,
  } from "lucide-react";
  
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Students",
    },
    {
      icon: BookOpen,
      value: "500+",
      label: "Articles",
    },
    {
      icon: GraduationCap,
      value: "100%",
      label: "Free Resources",
    },
  ];
  
  export default function CommunityStats() {
    return (
      <section
        className="
          rounded-[20px]
          border
          border-[#dce9f7]
          bg-white
          p-4
          shadow-[0_10px_30px_rgba(20,72,125,0.05)]
        "
      >
        <h3
          className="
            text-base
            font-black
            text-[#082b7a]
          "
        >
          Join a Growing Community
        </h3>
  
        <div
          className="
            mt-4
            grid
            grid-cols-3
            overflow-hidden
            rounded-[15px]
            border
            border-[#edf2f8]
            bg-[#fbfdff]
          "
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
  
            return (
              <div
                key={stat.label}
                className={`
                  flex
                  min-w-0
                  flex-col
                  items-center
                  px-2
                  py-4
                  text-center
                  ${
                    index !== 0
                      ? "border-l border-[#edf2f8]"
                      : ""
                  }
                `}
              >
                <Icon className="h-5 w-5 text-[#087be8]" />
  
                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-[#082b7a]
                  "
                >
                  {stat.value}
                </p>
  
                <p
                  className="
                    mt-0.5
                    text-[10px]
                    leading-4
                    text-[#7085aa]
                  "
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }