import {
    Heart,
    ShieldCheck,
    Users,
    Zap,
  } from "lucide-react";
  
  const items = [
    {
      icon: Users,
      label: "Trusted by",
      value: "50K+ Aspirants",
    },
    {
      icon: ShieldCheck,
      label: "Dedicated",
      value: "Support Team",
    },
    {
      icon: Zap,
      label: "Quick",
      value: "Response",
    },
    {
      icon: Heart,
      label: "Your Success",
      value: "Our Priority",
    },
  ];
  
  export default function ContactTrustBar() {
    return (
      <section
        className="
          border-t
          border-[#e5edf6]
          bg-white/80
          py-5
        " data-aos="fade-up"
      >
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            grid-cols-2
            gap-4
            px-4
            sm:px-6
            lg:grid-cols-4
          "
        >
          {items.map((item) => {
            const Icon = item.icon;
  
            return (
              <div
                key={item.value}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#edf6ff]
                    text-[#087ee9]
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>
  
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      text-[#7183a3]
                    "
                  >
                    {item.label}
                  </p>
  
                  <p
                    className="
                      text-xs
                      font-black
                      text-[#082b7a]
                    "
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }