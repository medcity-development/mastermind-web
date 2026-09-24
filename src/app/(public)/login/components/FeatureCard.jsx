import Link from "next/link";
import { ArrowRight } from "lucide-react";

const styles = {
  psc: {
    card: "from-[#eef9ff] via-[#e8f6ff] to-[#dcefff]",
    icon: "bg-[#d8efff] text-[#164fa5]",
    accent: "text-[#164fa5]",
    glow: "bg-[#00b5e8]/10",
  },

  rrb: {
    card: "from-[#fff5f8] via-[#fff0f5] to-[#ffe5ee]",
    icon: "bg-[#ffdeea] text-[#df1768]",
    accent: "text-[#df1768]",
    glow: "bg-[#df1768]/10",
  },

  faculty: {
    card: "from-[#fff9ed] via-[#fff5e3] to-[#ffedcf]",
    icon: "bg-[#ffedc1] text-[#e98b00]",
    accent: "text-[#e98b00]",
    glow: "bg-[#f59e0b]/10",
  },
};

export default function FeatureCard({
  type = "psc",
  icon: Icon,
  title,
  description,
  linkLabel,
}) {
  const theme =
    styles[type] ?? styles.psc;

  return (
    <article
      className={`
        group
        relative
        h-full
        min-h-0
        overflow-hidden
        rounded-[20px]
        border
        border-white/90
        bg-gradient-to-br
        ${theme.card}
        p-4
        shadow-[0_10px_28px_rgba(15,23,42,0.05)]
        transition
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]
      `}
    >
      <div
        aria-hidden="true"
        className={`
          absolute
          -bottom-16
          -right-12
          h-32
          w-32
          rounded-full
          ${theme.glow}
        `}
      />

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${theme.icon}
        `}
      >
        <Icon size={19} />
      </div>

      <h3
        className="
          mt-3
          text-[18px]
          font-black
          tracking-[-0.03em]
          text-[#0b216c]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1.5
          max-w-[250px]
          text-[12px]
          leading-5
          text-slate-600
        "
      >
        {description}
      </p>

      <Link
        href="#"
        className="
          absolute
          bottom-4
          left-4
          inline-flex
          items-center
          gap-2
          text-[12px]
          font-bold
          text-[#0b216c]
        "
      >
        {linkLabel}

        <ArrowRight
          size={14}
          className={theme.accent}
        />
      </Link>
    </article>
  );
}