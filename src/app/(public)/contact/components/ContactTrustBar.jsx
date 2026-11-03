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
        border-[#dceafa]
        bg-gradient-to-br
        from-[#eef7ff]
        via-[#f5f9ff]
        to-[#eaf4ff]
        px-4
        py-8
        sm:px-6
        sm:py-10
        lg:px-8
      "
      data-aos="fade-up"
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          grid-cols-1
          gap-3
          min-[420px]:grid-cols-2
          sm:gap-4
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
                min-h-[88px]
                items-center
                gap-3
                rounded-2xl
                border
                border-white
                bg-white/90
                px-4
                py-4
                shadow-[0_8px_24px_rgba(15,58,110,0.07)]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_12px_28px_rgba(15,58,110,0.12)]
                sm:px-5
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-[#e7f3ff]
                  to-[#d9edff]
                  text-[#087ee9]
                "
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-4 text-[#7183a3]">
                  {item.label}
                </p>

                <p className="text-xs font-black leading-5 text-[#082b7a] sm:text-[13px]">
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