import {
  BellRing,
  CalendarDays,
  FileText,
  Sparkles,
} from "lucide-react";

export default function NotificationsHero({
  examName,
  shortName,
}) {
  return (
    <section
      className="
        relative
        mt-20
        overflow-hidden
        rounded-[28px]
        bg-gradient-to-br
        from-[#071936]
        via-[#164fa5]
        to-[#087bea]
        px-5
        py-8
        text-white
        shadow-[0_20px_50px_rgba(11,33,108,0.18)]
        sm:px-7
        lg:px-10
        lg:py-10
      "
    >
      {/* GRID */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.09]
          [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
          [background-size:32px_32px]
        "
      />

      {/* GLOW */}

      <div
        aria-hidden="true"
        className="
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-[#00b5e8]/25
          blur-[80px]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-28
          left-[35%]
          h-64
          w-64
          rounded-full
          bg-[#df1768]/15
          blur-[90px]
        "
      />

      <div
        className="
          relative
          z-10
          grid
          items-center
          gap-8
          lg:grid-cols-[minmax(0,1fr)_auto]
        "
      >
        {/* CONTENT */}

        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3
              py-1.5
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[#8ee9ff]
              backdrop-blur-md
            "
          >
            <Sparkles size={13} />

            {shortName || examName} Updates
          </div>

          <h1
            className="
              mt-4
              max-w-3xl
              text-3xl
              font-black
              tracking-[-0.04em]
              sm:text-4xl
              lg:text-5xl
            "
          >
            Latest {examName}

            <span className="text-[#69ddff]">
              {" "}
              Notifications
            </span>
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-[12px]
              leading-6
              text-white/70
              sm:text-[13px]
            "
          >
            Stay updated with the latest {examName}
            notifications, important dates,
            application deadlines and official
            notification PDFs.
          </p>
        </div>

        {/* ICONS */}

        <div
          className="
            hidden
            items-center
            gap-3
            lg:flex
          "
        >
          <HeroIcon icon={BellRing} />
          <HeroIcon icon={CalendarDays} />
          <HeroIcon icon={FileText} />
        </div>
      </div>
    </section>
  );
}

function HeroIcon({
  icon: Icon,
}) {
  return (
    <div
      className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-[20px]
        border
        border-white/15
        bg-white/10
        text-white
        backdrop-blur-md
      "
    >
      <Icon size={24} />
    </div>
  );
}