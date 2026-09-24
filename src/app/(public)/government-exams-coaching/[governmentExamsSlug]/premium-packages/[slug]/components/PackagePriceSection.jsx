import Link from "next/link";

import {
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

export default function PackagePriceSection({
  price,
  purchaseAvailable,
}) {
  if (!price) {
    return null;
  }

  const currentPrice =
    price?.final ||
    price?.current ||
    "";

  const originalPrice =
    price?.original || "";

  return (
    <section
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_10px_30px_rgba(22,79,165,0.05)]
      "
    >
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[1fr_auto]
        "
      >
        {/* PRICE */}
        <div
          className="
            flex
            flex-col
            gap-5
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-[15px]
                bg-gradient-to-br
                from-[#164fa5]
                to-[#017cc0]
                text-white
                shadow-[0_10px_24px_rgba(22,79,165,0.18)]
              "
            >
              <BadgeIndianRupee
                size={21}
              />
            </div>

            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#017cc0]
                "
              >
                Plan Price
              </p>

              <div
                className="
                  mt-1
                  flex
                  flex-wrap
                  items-end
                  gap-2
                "
              >
                <span
                  className="
                    text-[30px]
                    font-black
                    leading-none
                    text-[#05176A]
                  "
                >
                  ₹{currentPrice}
                </span>

                {originalPrice &&
                  originalPrice !==
                    currentPrice && (
                    <span
                      className="
                        pb-0.5
                        text-sm
                        font-bold
                        text-slate-400
                        line-through
                      "
                    >
                      ₹{originalPrice}
                    </span>
                  )}
              </div>

              {purchaseAvailable && (
                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    font-bold
                    text-emerald-600
                  "
                >
                  <CheckCircle2
                    size={13}
                  />

                  Available for purchase
                </div>
              )}
            </div>
          </div>

          {/* PURCHASE BUTTON */}
          {purchaseAvailable && (
            <Link
              href="/login"
              className="
                group
                inline-flex
                min-h-[46px]
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#164fa5]
                via-[#017cc0]
                to-[#00b5e8]
                px-6
                text-[11px]
                font-black
                text-white
                shadow-[0_10px_25px_rgba(22,79,165,0.18)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_14px_30px_rgba(22,79,165,0.25)]
                sm:w-auto
              "
            >
              <ShoppingBag
                size={15}
              />

              Purchase Now
            </Link>
          )}
        </div>

        {/* VALIDITY */}
        <div
          className="
            flex
            items-center
            border-t
            border-[#e7edf7]
            bg-[#f7faff]
            px-5
            py-4
            lg:min-w-[220px]
            lg:border-l
            lg:border-t-0
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
              rounded-[12px]
              bg-[#e7f4ff]
              text-[#017cc0]
            "
          >
            <CalendarDays
              size={17}
            />
          </div>

          <div className="ml-3">
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              Validity
            </p>

            <p
              className="
                mt-0.5
                text-[13px]
                font-black
                text-[#05176A]
              "
            >
              {price?.validity ||
                `${price?.days || ""} Days`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}