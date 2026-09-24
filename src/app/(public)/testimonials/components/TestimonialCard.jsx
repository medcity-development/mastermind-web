import Image from "next/image";

import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Star,
  Users,
} from "lucide-react";

export default function TestimonialCard({
  student,
}) {
  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/90
        bg-white
        shadow-[0_14px_40px_rgba(15,23,42,0.07)]
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)]
        sm:rounded-[24px]
      "  data-aos="fade-right"
    >
      {/* subtle decorative glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-36
          w-36
          rounded-full
          bg-sky-100/70
          blur-3xl
        "
      />

      <div
        className="
          relative
          grid
          grid-cols-1
          md:grid-cols-[170px_minmax(0,1fr)]
        "
      >
        {/* =================================================
            STUDENT AREA
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            border-b
            border-slate-100
            md:grid-rows-[170px_auto]
            md:border-b-0
            md:border-r
            md:border-slate-100
          "
        >
          {/* IMAGE */}

          <div
            className="
              flex
              min-h-[170px]
              items-center
              justify-center
              bg-gradient-to-b
              from-slate-50
              to-white
              px-4
              py-5

              md:min-h-0
              md:px-4
              md:py-4
            "
          >
            <div
              className="
                mx-auto
                h-[130px]
                w-[130px]
                shrink-0
                overflow-hidden
                rounded-2xl
              "
            >
              <Image
                src={student.image}
                alt={`${student.name} - ${student.role}`}
                width={130}
                height={130}
                sizes="
                  (max-width: 767px) 130px,
                  130px
                "
                className="
                  h-full
                  w-full
                  object-cover
                  object-center
                "
              />
            </div>
          </div>

          {/* STUDENT DETAILS */}

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              bg-gradient-to-br
              from-[#071936]
              via-[#0a2650]
              to-[#0b2b59]
              px-5
              py-5
              text-center

              md:items-start
              md:px-4
              md:py-4
              md:text-left
            "
          >
            <h3
              className="
                text-[17px]
                font-black
                text-white
                md:text-base
              "
            >
              {student.name}
            </h3>

            <p
              className="
                mt-1
                text-[11px]
                font-bold
                leading-5
                text-cyan-200
              "
            >
              {student.role}
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-white/60
              "
            >
              {student.location}
            </p>
          </div>
        </div>

        {/* =================================================
            TESTIMONIAL CONTENT
        ================================================= */}

        <div
          className="
            relative
            flex
            min-w-0
            flex-col
            p-5
            sm:p-6
            lg:p-7
          "
        >
          {/* rating + badge */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
                text-amber-400
              "
            >
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={star}
                    size={15}
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                )
              )}
            </div>

            <span
              className="
                rounded-full
                bg-pink-50
                px-2.5
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.14em]
                text-pink-600
              "
            >
              Student Story
            </span>
          </div>

          {/* title */}

          <h3
            className="
              mt-4
              text-[18px]
              font-black
              leading-[1.35]
              text-[#071936]
              sm:text-[19px]
              lg:text-[20px]
            "
          >
            “{student.title}”
          </h3>

          {/* testimonial */}

          <p
            className="
              mt-3
              text-[12px]
              leading-[1.85]
              text-slate-600
              sm:text-[13px]
            "
          >
            {student.text}
          </p>

          {/* features */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-2.5
              border-t
              border-slate-100
              pt-4

              min-[430px]:grid-cols-3

              md:mt-auto
              md:grid-cols-3
            "
          >
            <Feature
              icon={Users}
              label="Faculty"
              iconClass="
                bg-pink-50
                text-pink-600
              "
            />

            <Feature
              icon={BookOpen}
              label="Materials"
              iconClass="
                bg-blue-50
                text-blue-600
              "
            />

            <Feature
              icon={
                ChartNoAxesColumnIncreasing
              }
              label="Mock Tests"
              iconClass="
                bg-emerald-50
                text-emerald-600
              "
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function Feature({
  icon: Icon,
  label,
  iconClass,
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
        rounded-xl
        bg-slate-50/80
        px-2.5
        py-2

        md:bg-transparent
        md:px-0
        md:py-0
      "
    >
      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >
        <Icon
          size={14}
          strokeWidth={2}
        />
      </div>

      <span
        className="
          whitespace-nowrap
          text-[10px]
          font-bold
          text-slate-700
        "
      >
        {label}
      </span>
    </div>
  );
}