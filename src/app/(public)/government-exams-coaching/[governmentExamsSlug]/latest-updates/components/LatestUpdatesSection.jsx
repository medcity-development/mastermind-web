import LatestUpdateCard from "./LatestUpdateCard";

import {
  latestUpdates,
} from "./latestUpdatesData";

export default function LatestUpdatesSection({
  cid,
  examName,
  shortName,
  governmentExamsSlug,
}) {
  const basePath =
    `/government-exams-coaching/${governmentExamsSlug}`;

  const dynamicUpdates =
    latestUpdates.map(
      (item) => ({
        ...item,

        href:
          `${basePath}/${item.path}`,

        subtitle:
          item.path ===
          "exam-syllabus"
            ? `${examName} Syllabus`
            : item.subtitle,
      })
    );

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-[22px]
        border
        border-[#e2edf7]
        bg-gradient-to-br
        from-white
        via-[#fbfdff]
        to-[#eef8ff]
        px-4
        py-4
        shadow-[0_10px_28px_rgba(15,58,110,0.05)]

        sm:px-5
        lg:px-6
      "
    >
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-10
          h-40
          w-[55%]
          rounded-[50%]
          bg-[#dff3ff]
          opacity-80
          blur-[10px]
        "
      />

      <div
        className="
          relative
          z-10
          grid
          gap-4

          lg:grid-cols-[190px_minmax(0,1fr)]
          xl:grid-cols-[210px_minmax(0,1fr)]
        "
      >
        {/* =================================================
            HEADING
        ================================================= */}

        <div
          data-aos="fade-right"
          className="
            flex
            flex-col
            justify-center

            max-lg:items-center
            max-lg:text-center
          "
        >
          <p
            className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.17em]
              text-[#164fa5]
            "
          >
            {shortName} Updates
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-black
              leading-tight
              tracking-[-0.035em]
              text-[#0b216c]

              sm:text-[28px]
            "
          >
            Latest Updates
          </h2>

          <div
            className="
              mt-2
              h-[3px]
              w-9
              rounded-full
              bg-[#f13873]
            "
          />
        </div>

        {/* =================================================
            CARDS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-3

            md:grid-cols-3
          "
        >
          {dynamicUpdates.map(
            (item) => (
              <LatestUpdateCard
                key={
                  item.path
                }
                item={
                  item
                }
                examName={
                  examName
                }
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}