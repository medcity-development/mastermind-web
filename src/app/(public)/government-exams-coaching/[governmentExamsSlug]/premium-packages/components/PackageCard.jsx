
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function PackageCard({ item }) {
  return (
    <article
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_12px_35px_rgba(22,79,165,0.07)]
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-[#017dc0]/30
        hover:shadow-[0_24px_55px_rgba(22,79,165,0.14)]
      "
    >
      {/* Top decorative glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-[#00b5e8]/10
          blur-3xl
        "
      />

      {/* IMAGE SECTION */}
      <div
        className="
          relative
          m-3
          h-[220px]
          overflow-hidden
          rounded-[20px]
          border
          border-[#dce8f7]/80
          bg-gradient-to-br
          from-[#f5fbff]
          via-[#edf7ff]
          to-[#e4f2ff]
          sm:h-[230px]
        "
      >
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            opacity-[0.04]
            [background-image:linear-gradient(to_right,#164fa5_1px,transparent_1px),linear-gradient(to_bottom,#164fa5_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />

        {item?.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item?.package || "Premium package"}
            fill
            className="
              object-contain
              p-3
              transition-transform
              duration-500
              group-hover:scale-[1.03]
            "
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              33vw
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-[#017dc0]
            "
          >
            <Crown size={48} strokeWidth={1.8} />
          </div>
        )}

        {/* Premium badge */}
        <div
          className="
            absolute
            left-3
            top-3
            z-10
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/80
            bg-white/95
            px-3
            py-1.5
            shadow-[0_6px_18px_rgba(15,23,42,0.08)]
            backdrop-blur-md
          "
        >
          <Crown
            size={12}
            className="text-[#f59e0b]"
            fill="currentColor"
          />

          <span
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-[#05176A]
            "
          >
            Premium
          </span>
        </div>

        {/* Small highlight icon */}
        <div
          className="
            absolute
            bottom-3
            right-3
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-[#017dc0]
            shadow-sm
            backdrop-blur
          "
        >
          <Sparkles size={14} />
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10
          flex
          flex-1
          flex-col
          px-5
          pb-5
          pt-2
        "
      >
        {/* Category */}
        <div
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            bg-[#eef7ff]
            px-3
            py-1.5
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.08em]
            text-[#017dc0]
          "
        >
          <GraduationCap size={14} />

          Kerala PSC
        </div>

        {/* Title */}
        <h3
          className="
            mt-4
            line-clamp-2
            text-[18px]
            font-black
            leading-[1.35]
            text-[#05176A]
            transition-colors
            duration-300
            group-hover:text-[#017dc0]
            sm:text-[19px]
          "
        >
          {item?.package}
        </h3>

        {/* Description / Tag */}
        {item?.tag && (
          <p
            className="
              mt-2
              line-clamp-2
              text-[12px]
              font-medium
              leading-5
              text-slate-500
            "
          >
            {item.tag}
          </p>
        )}

        {/* Divider */}
        <div
          className="
            mt-5
            h-px
            w-full
            bg-gradient-to-r
            from-transparent
            via-[#dce8f7]
            to-transparent
          "
        />

        {/* Button */}
        <div className="mt-auto pt-5">
          <Link
            href={`/government-exams-coaching/kerala-psc/premium-packages/${item?.slug}`}
            className="
              group/button
              flex
              w-full
              items-center
              justify-between
              rounded-[15px]
              bg-gradient-to-r
              from-[#05176A]
              via-[#164fa5]
              to-[#017cc0]
              px-4
              py-3.5
              text-[11px]
              font-black
              uppercase
              tracking-[0.06em]
              text-white
              shadow-[0_10px_24px_rgba(22,79,165,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_14px_30px_rgba(22,79,165,0.3)]
            "
          >
            <span>View Package</span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white/15
                transition-transform
                duration-300
                group-hover/button:translate-x-1
              "
            >
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

