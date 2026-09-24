import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Check,
} from "lucide-react";

export default function MainCourseCard({
  course,
  filePath = "",
  href = "/main-courses",
  points = [],
}) {
  const title =
    course?.exam || "Course";

  const subtitle =
    course?.exam_mal || "";

  const cleanFilePath =
    String(filePath).replace(
      /\/+$/,
      ""
    );

  const cleanIcon =
    String(
      course?.icon || ""
    ).replace(
      /^\/+/,
      ""
    );

  const imageUrl =
    cleanFilePath && cleanIcon
      ? `${cleanFilePath}/${cleanIcon}`
      : "/assets/default-course.png";

  const isPSC =
    Number(course?.id) === 1;

  return (
    <Link
      href={href}
      className={`
        group
        relative
        flex
        min-h-[390px]
        w-full
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        p-5
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_22px_55px_rgba(10,52,112,0.13)]
        sm:p-6

        ${
          isPSC
            ? `
                border-[#cfe4ff]
                bg-gradient-to-br
                from-[#f8fbff]
                via-white
                to-[#eef6ff]
              `
            : `
                border-[#f4dce7]
                bg-gradient-to-br
                from-[#fffafb]
                via-white
                to-[#fff1f5]
              `
        }
      `}
    >
      {/* Glow */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-44
          w-44
          rounded-full
          blur-3xl

          ${
            isPSC
              ? "bg-[#00b5e8]/10"
              : "bg-[#f13873]/10"
          }
        `}
      />

      {/* Top accent */}
      <div
        aria-hidden="true"
        className={`
          absolute
          left-5
          right-5
          top-0
          h-[3px]
          rounded-b-full

          ${
            isPSC
              ? `
                  bg-gradient-to-r
                  from-[#164fa5]
                  via-[#017cc0]
                  to-[#00b5e8]
                `
              : `
                  bg-gradient-to-r
                  from-[#0b216c]
                  via-[#164fa5]
                  to-[#f13873]
                `
          }
        `}
      />

      {/* HEADER */}
      <div
        className="
          relative
          z-10
          grid
          grid-cols-[72px_minmax(0,1fr)]
          items-center
          gap-4
        "
      >
        <div
          className="
            relative
            h-[72px]
            w-[72px]
            overflow-hidden
            rounded-[20px]
            border
            border-[#dbe7f4]
            bg-white
            shadow-[0_8px_22px_rgba(0,0,0,0.07)]
          "
        >
          <Image
            src={imageUrl}
            alt={`${title} logo`}
            fill
            sizes="72px"
            className="
              object-contain
              p-2.5
            "
          />
        </div>

        <div className="min-w-0">
          <h4
            className="
              text-[20px]
              font-extrabold
              leading-tight
              text-[#0b216c]
            "
          >
            {title}
          </h4>

          {subtitle && (
            <p
              className="
                mt-1.5
                text-[12px]
                leading-5
                text-slate-500
              "
            >
              {subtitle}
            </p>
          )}

          <span
            className={`
              mt-3
              block
              h-[3px]
              w-8
              rounded-full

              ${
                isPSC
                  ? "bg-[#017cc0]"
                  : "bg-[#f13873]"
              }
            `}
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className="
          relative
          z-10
          my-5
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-[#164fa5]/10
          to-transparent
        "
      />

      {/* Points */}
      {points.length > 0 && (
        <div
          className="
            relative
            z-10
            space-y-3
          "
        >
          {points.map((point) => (
            <div
              key={point}
              className="
                flex
                items-start
                gap-2.5
              "
            >
              <span
                className={`
                  mt-[2px]
                  flex
                  h-[18px]
                  w-[18px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-white

                  ${
                    isPSC
                      ? "bg-[#017cc0]"
                      : "bg-[#f13873]"
                  }
                `}
              >
                <Check
                  size={11}
                  strokeWidth={3}
                />
              </span>

              <span
                className="
                  text-[12px]
                  leading-5
                  text-[#53617e]
                "
              >
                {point}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="
          relative
          z-10
          mt-auto
          flex
          items-center
          justify-between
          pt-7
        "
      >
        <span
          className={`
            text-[12px]
            font-bold

            ${
              isPSC
                ? "text-[#164fa5]"
                : "text-[#f13873]"
            }
          `}
        >
          Explore {title}
        </span>

        <span
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-white
            transition-all
            duration-300
            group-hover:translate-x-1

            ${
              isPSC
                ? `
                    bg-gradient-to-br
                    from-[#164fa5]
                    to-[#017cc0]
                  `
                : `
                    bg-gradient-to-br
                    from-[#0b216c]
                    to-[#f13873]
                  `
            }
          `}
        >
          <ArrowRight size={17} />
        </span>
      </div>
    </Link>
  );
}