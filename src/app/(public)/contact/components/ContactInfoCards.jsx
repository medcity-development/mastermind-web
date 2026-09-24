import {
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const items = [
  {
    icon: Phone,
    title: "Call Us",
    text: "Speak to our support team",
    value: "+91 9846 123 456",
    iconBg:
      "from-[#164fa5] to-[#017cc0]",
    glow: "bg-[#00b5e8]/20",
    line:
      "from-[#164fa5] to-[#00b5e8]",
  },
  {
    icon: Mail,
    title: "Email Us",
    text: "Send us your queries",
    value: "hello@mastermindpsc.com",
    iconBg:
      "from-[#f13873] to-[#c72c67]",
    glow: "bg-[#f13873]/20",
    line:
      "from-[#f13873] to-[#ff7eaa]",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    text: "Our office location",
    value: "Kochi, Kerala, India",
    iconBg:
      "from-[#017cc0] to-[#00b5e8]",
    glow: "bg-[#00b5e8]/20",
    line:
      "from-[#017cc0] to-[#00b5e8]",
  },
  {
    icon: Clock3,
    title: "Working Hours",
    text: "Mon – Sat, 9:00 AM – 6:00 PM",
    value:
      "We’ll respond as soon as possible",
    iconBg:
      "from-[#0b216c] to-[#164fa5]",
    glow: "bg-[#164fa5]/20",
    line:
      "from-[#0b216c] to-[#164fa5]",
  },
];

export default function ContactInfoCards() {
  return (
    <section
      className="
        mt-5
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
      data-aos="fade-up"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="
              group
              relative
              min-h-[118px]
              overflow-hidden
              rounded-[20px]
              border
              border-[#164fa5]/10
              bg-white
              p-4
              shadow-[0_12px_32px_rgba(11,33,108,0.07)]
              transition-all
              duration-300
              hover:-translate-y-1.5
              hover:border-[#017cc0]/20
              hover:shadow-[0_20px_45px_rgba(11,33,108,0.13)]
            "
          >
            {/* top accent */}
            <div
              className={`
                absolute
                inset-x-0
                top-0
                h-[3px]
                bg-gradient-to-r
                ${item.line}
              `}
            />

            {/* background glow */}
            <div
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-28
                w-28
                rounded-full
                blur-[35px]
                transition-transform
                duration-500
                group-hover:scale-125
                ${item.glow}
              `}
            />

            <div
              className="
                relative
                z-10
                flex
                items-center
                gap-4
              "
            >
              {/* icon */}
              <div
                className={`
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-gradient-to-br
                  ${item.iconBg}
                  text-white
                  shadow-[0_8px_20px_rgba(11,33,108,0.18)]
                `}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2.2}
                />
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    text-sm
                    font-black
                    text-[#0b216c]
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-[10px]
                    font-medium
                    text-[#7284a6]
                  "
                >
                  {item.text}
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    font-extrabold
                    leading-4
                    text-[#164fa5]
                  "
                >
                  {item.value}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}