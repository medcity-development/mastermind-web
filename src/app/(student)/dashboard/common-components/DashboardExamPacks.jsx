import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

export default function DashboardExamPacks({
  config,
}) {
  if (!config) {
    return null;
  }

  const isRrb =
    config.slug === "rrb-ssc";

  const packs =
    isRrb
      ? [
          {
            id: 1,
            title:
              "RRB NTPC Complete Batch",
            price:
              "Starting from ₹2,499",
          },
          {
            id: 2,
            title:
              "SSC CGL Premium Batch",
            price:
              "Starting from ₹2,999",
          },
          {
            id: 3,
            title:
              "RRB Group D Batch",
            price:
              "Starting from ₹1,999",
          },
          {
            id: 4,
            title:
              "SSC CHSL Batch",
            price:
              "Starting from ₹2,499",
          },
        ]
      : [
          {
            id: 1,
            title:
              "Mission LDC 2026-27",
            price:
              "Starting from ₹2,499",
          },
          {
            id: 2,
            title:
              "10th Level Long-Term Batch",
            price:
              "Starting from ₹3,499",
          },
          {
            id: 3,
            title:
              "Degree Foundation Course",
            price:
              "Starting from ₹2,999",
          },
          {
            id: 4,
            title:
              "LGS Crash Batch 2025",
            price:
              "Starting from ₹2,099",
          },
          {
            id: 5,
            title:
              "Civil Police Officer",
            price:
              "Starting from ₹2,499",
          },
        ];

  const image =
    isRrb
      ? "/assets/rrb-ssc-coaching.webp"
      : "/assets/kerala-psc-coaching.webp";

  return (
    <section
      className="
        rounded-[24px]
        border
        border-slate-100
        bg-white
        p-5
        shadow-[0_16px_45px_rgba(15,23,42,0.05)]
        sm:p-6
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-blue-500
            "
          >
            Kerala PSC
          </p>

          <h2
            className="
              mt-1
              text-[21px]
              font-extrabold
              tracking-[-0.03em]
              text-[#071b59]
            "
          >
            Competitive Exam Packs
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Complete preparation packages
            at special prices
          </p>
        </div>

        <Link
          href={`${config.basePath}/premium-packages`}
          className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-blue-200
            px-4
            py-2
            text-[9px]
            font-bold
            text-blue-600
            sm:inline-flex
          "
        >
          View All Packs

          <ArrowRight
            size={12}
          />
        </Link>
      </div>

      <div
        className="
          mt-5
          grid
          gap-3
          lg:grid-cols-2
        "
      >
        {packs.map(
          (pack) => (
            <article
              key={pack.id}
              className="
                flex
                gap-4
                rounded-[16px]
                border
                border-slate-100
                bg-[#fcfdff]
                p-3
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:border-blue-100
                hover:shadow-[0_10px_25px_rgba(15,23,42,0.06)]
              "
            >
              <div
                className="
                  relative
                  h-[88px]
                  w-[118px]
                  shrink-0
                  overflow-hidden
                  rounded-[11px]
                  bg-[#edf3fa]
                "
              >
                <Image
                  src={image}
                  alt={pack.title}
                  fill
                  sizes="118px"
                  className="
                    object-cover
                  "
                />
              </div>

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  flex-col
                  justify-center
                "
              >
                <p
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-blue-500
                  "
                >
                  {config.shortName}
                </p>

                <h3
                  className="
                    mt-1
                    line-clamp-2
                    text-[11px]
                    font-bold
                    text-[#071b59]
                  "
                >
                  {pack.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-[8px]
                    text-slate-400
                  "
                >
                  {pack.price}
                </p>

                <Link
                  href={`${config.basePath}/premium-packages`}
                  className="
                    mt-2
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#ff7698]
                    px-3
                    py-1.5
                    text-[8px]
                    font-bold
                    text-[#ff4776]
                    transition

                    hover:bg-[#ff4776]
                    hover:text-white
                  "
                >
                  View Details

                  <ArrowRight
                    size={10}
                  />
                </Link>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}