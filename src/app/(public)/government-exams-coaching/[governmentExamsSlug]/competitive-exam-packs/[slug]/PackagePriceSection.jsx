import {
  CalendarDays,
  Clock3,
  IndianRupee,
  Percent,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";

import PriceInfo from "./PriceInfo";

export default function PackagePriceSection({
  price,
}) {
  if (!price) {
    return null;
  }

  const currentPrice =
    Number(
      price?.current || 0
    );

  const originalPrice =
    Number(
      price?.original || 0
    );

  const saving =
    originalPrice >
    currentPrice
      ? originalPrice -
        currentPrice
      : 0;

  const discount =
    originalPrice >
      currentPrice &&
    originalPrice > 0
      ? Math.round(
          ((originalPrice -
            currentPrice) /
            originalPrice) *
            100
        )
      : 0;

  return (
    <section
      className="
        relative
        mt-8
        overflow-hidden
        rounded-[28px]
        border
        border-[#dbe8f4]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#f4f9ff]
        p-6
        shadow-[0_18px_50px_rgba(15,58,110,0.08)]
        sm:p-8
      "
    >
      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-64
          w-64
          rounded-full
          bg-[#164fa5]/10
          blur-[90px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
          [background-image:linear-gradient(#164fa5_1px,transparent_1px),linear-gradient(90deg,#164fa5_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

      <div className="relative z-10">
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[16px]
                bg-gradient-to-br
                from-[#164fa5]
                to-[#0c8bc3]
                text-white
                shadow-[0_10px_25px_rgba(22,79,165,0.25)]
              "
            >
              <WalletCards
                size={23}
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.14em]
                  text-[#f13873]
                "
              >
                Pricing
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  tracking-[-0.03em]
                  text-[#0b216c]
                "
              >
                Price Details
              </h2>
            </div>
          </div>

          {discount > 0 && (
            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-[#fff0f5]
                px-3
                py-2
                text-[10px]
                font-black
                text-[#d92f67]
              "
            >
              <Sparkles
                size={14}
              />

              {discount}% OFF
            </div>
          )}
        </div>

        {/* MAIN PRICE */}

        <div
          className="
            mt-7
            rounded-[24px]
            border
            border-[#dce8f4]
            bg-white
            p-5
            shadow-[0_12px_30px_rgba(15,58,110,0.06)]
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#7a8ba4]
                "
              >
                Package Price
              </p>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    text-[36px]
                    font-black
                    leading-none
                    tracking-[-0.04em]
                    text-[#0b216c]
                  "
                >
                  <IndianRupee
                    className="
                      h-7
                      w-7
                    "
                  />

                  {price?.current}
                </div>

                {originalPrice >
                  currentPrice && (
                  <span
                    className="
                      text-[15px]
                      font-semibold
                      text-slate-400
                      line-through
                    "
                  >
                    ₹
                    {
                      price?.original
                    }
                  </span>
                )}

                {discount >
                  0 && (
                  <span
                    className="
                      rounded-full
                      bg-[#f13873]
                      px-3
                      py-1.5
                      text-[10px]
                      font-black
                      text-white
                    "
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>

              {saving > 0 && (
                <p
                  className="
                    mt-3
                    text-[12px]
                    font-bold
                    text-[#16824f]
                  "
                >
                  You save ₹
                  {saving}
                </p>
              )}
            </div>

            {/* FINAL PRICE */}

            <div
              className="
                rounded-[18px]
                border
                border-[#f13873]/15
                bg-gradient-to-br
                from-[#fff5f8]
                to-white
                px-5
                py-4
                lg:min-w-[190px]
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#d92f67]
                "
              >
                Final Payable
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-black
                  text-[#0b216c]
                "
              >
                ₹
                {
                  price?.final
                }
              </p>
            </div>
          </div>

          {/* DETAILS */}

          <div
            className="
              mt-6
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-5
            "
          >
            <PriceInfo
              label="Subtotal"
              value={
                price?.subtotal
                  ? `₹${price.subtotal}`
                  : "-"
              }
              icon={
                <ReceiptText
                  size={20}
                />
              }
            />

            <PriceInfo
              label="GST"
              value={
                `${price?.gst || 0}%`
              }
              icon={
                <Percent
                  size={20}
                />
              }
            />

            <PriceInfo
              label="Final Price"
              value={
                price?.final
                  ? `₹${price.final}`
                  : "-"
              }
              icon={
                <IndianRupee
                  size={20}
                />
              }
            />

            <PriceInfo
              label="Validity"
              value={
                price?.validity ||
                "-"
              }
              icon={
                <CalendarDays
                  size={20}
                />
              }
            />

            <PriceInfo
              label="Duration"
              value={
                price?.days
                  ? `${price.days} Days`
                  : "-"
              }
              icon={
                <Clock3
                  size={20}
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}