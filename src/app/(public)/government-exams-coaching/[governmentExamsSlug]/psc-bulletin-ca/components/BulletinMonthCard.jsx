import {
    ArrowUpRight,
    CalendarDays,
    Crown,
    LockKeyhole,
  } from "lucide-react";
  
  export default function BulletinMonthCard({
    item,
    onClick,
  }) {
    const access =
      String(
        item?.access || ""
      )
        .trim()
        .toLowerCase();
  
    const isPaid =
      access === "paid";
  
    return (
      <button
        type="button"
        onClick={onClick}
        className="
          group
          relative
          flex
          w-full
          cursor-pointer
          flex-col
          overflow-hidden
          rounded-[20px]
          border
          border-[#dce8f7]
          bg-gradient-to-br
          from-white
          via-[#fbfdff]
          to-[#f1f7ff]
          p-5
          text-left
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-[#017cc0]/30
          hover:shadow-[0_18px_38px_rgba(22,79,165,0.11)]
        "
      >
        {/* GLOW */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-14
            -top-14
            h-36
            w-36
            rounded-full
            bg-[#017cc0]/7
            blur-2xl
          "
        />
  
        <div
          className="
            relative
            z-10
            flex
            w-full
            items-start
            justify-between
            gap-4
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
              rounded-[14px]
              bg-gradient-to-br
              from-[#164fa5]
              to-[#017cc0]
              text-white
              shadow-[0_8px_20px_rgba(22,79,165,0.18)]
            "
          >
            <CalendarDays
              size={18}
            />
          </div>
  
          {isPaid ? (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-3
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.08em]
                text-amber-700
              "
            >
              <Crown size={10} />
  
              Premium
            </span>
          ) : (
            <span
              className="
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                px-3
                py-1.5
                text-[8px]
                font-black
                uppercase
                text-emerald-700
              "
            >
              Free
            </span>
          )}
        </div>
  
        <div
          className="
            relative
            z-10
            mt-5
            w-full
          "
        >
          <p
            className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-400
            "
          >
            PSC Bulletin
          </p>
  
          <h3
            className="
              mt-1
              text-lg
              font-black
              text-[#05176A]
            "
          >
            {item?.month}{" "}
            {item?.year}
          </h3>
  
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                flex
                items-center
                gap-1.5
                text-[9px]
                font-bold
                text-slate-500
              "
            >
              {isPaid && (
                <LockKeyhole
                  size={11}
                />
              )}
  
              {isPaid
                ? "Premium access"
                : "Open bulletin"}
            </span>
  
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-[#dce8f7]
                bg-white
                text-[#017cc0]
                transition-all
                duration-300
                group-hover:border-[#017cc0]
                group-hover:bg-[#017cc0]
                group-hover:text-white
              "
            >
              <ArrowUpRight
                size={14}
              />
            </span>
          </div>
        </div>
      </button>
    );
  }