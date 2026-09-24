import {
    BookOpenCheck,
    CalendarDays,
    CheckCircle2,
    Target,
    Trophy,
    UserRoundCheck,
  } from "lucide-react";
  
  /* =========================================================
     NORMALIZE DESCRIPTION
  ========================================================= */
  
  function normalizeDescription(
    description = ""
  ) {
    return String(description)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\?\s*Course Highlights:/i, "Course Highlights:")
      .replace(/\?\s*Duration:/i, "Duration:")
      .replace(/\?\s*Ideal For:/i, "Ideal For:")
      .replace(/\?\s*Outcome:/i, "Outcome:")
      .trim();
  }
  
  /* =========================================================
     GET SECTION
  ========================================================= */
  
  function getSection(
    text,
    startHeading,
    nextHeadings = []
  ) {
    const startPattern =
      new RegExp(
        `${startHeading}\\s*:`,
        "i"
      );
  
    const startMatch =
      text.match(startPattern);
  
    if (!startMatch) {
      return "";
    }
  
    const startIndex =
      startMatch.index +
      startMatch[0].length;
  
    let endIndex =
      text.length;
  
    nextHeadings.forEach(
      (heading) => {
        const regex =
          new RegExp(
            `${heading}\\s*:`,
            "i"
          );
  
        const remainder =
          text.slice(
            startIndex
          );
  
        const match =
          remainder.match(regex);
  
        if (
          match &&
          startIndex +
            match.index <
            endIndex
        ) {
          endIndex =
            startIndex +
            match.index;
        }
      }
    );
  
    return text
      .slice(
        startIndex,
        endIndex
      )
      .trim();
  }
  
  /* =========================================================
     COURSE HIGHLIGHTS
  ========================================================= */
  
  function getHighlights(
    description
  ) {
    const content =
      getSection(
        description,
        "Course Highlights",
        [
          "Duration",
          "Ideal For",
          "Outcome",
        ]
      );
  
    if (!content) {
      return [];
    }
  
    return content
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }
  
  /* =========================================================
     COMPONENT
  ========================================================= */
  
  export default function PackageDescriptionSection({
    description = "",
  }) {
    if (!description) {
      return null;
    }
  
    const formatted =
      normalizeDescription(
        description
      );
  
    const highlights =
      getHighlights(
        formatted
      );
  
    const duration =
      getSection(
        formatted,
        "Duration",
        [
          "Ideal For",
          "Outcome",
        ]
      );
  
    const idealFor =
      getSection(
        formatted,
        "Ideal For",
        ["Outcome"]
      );
  
    const outcome =
      getSection(
        formatted,
        "Outcome",
        []
      );
  
    const hasDetails =
      highlights.length > 0 ||
      duration ||
      idealFor ||
      outcome;
  
    if (!hasDetails) {
      return null;
    }
  
    return (
      <section
        className="
          relative
          mt-8
          overflow-hidden
          rounded-[28px]
          border
          border-[#dfe9f4]
          bg-white
          p-6
          shadow-[0_18px_45px_rgba(15,58,110,0.07)]
          sm:p-8
        "
      >
        {/* BACKGROUND */}
  
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
              items-center
              gap-3
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-[16px]
                bg-[#edf6ff]
                text-[#164fa5]
              "
            >
              <BookOpenCheck
                size={22}
              />
            </span>
  
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#f13873]
                "
              >
                Course Details
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
                What You'll Get
              </h2>
  
              <p
                className="
                  mt-1
                  text-[12px]
                  text-slate-500
                "
              >
                Everything you need to know about this package.
              </p>
            </div>
          </div>
  
          {/* COURSE HIGHLIGHTS */}
  
          {highlights.length >
            0 && (
            <div className="mt-7">
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#eef6ff]
                    text-[#075fc8]
                  "
                >
                  <Trophy
                    size={16}
                  />
                </span>
  
                <h3
                  className="
                    text-[16px]
                    font-black
                    text-[#0b216c]
                  "
                >
                  Course Highlights
                </h3>
              </div>
  
              <div
                className="
                  grid
                  gap-3
                  md:grid-cols-2
                "
              >
                {highlights.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item}-${index}`}
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-[16px]
                        border
                        border-[#e4edf6]
                        bg-[#fbfdff]
                        p-4
                      "
                    >
                      <CheckCircle2
                        size={17}
                        className="
                          mt-1
                          shrink-0
                          text-[#19a463]
                        "
                      />
  
                      <p
                        className="
                          text-[13px]
                          leading-6
                          text-[#526581]
                        "
                      >
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
  
          {/* DETAILS */}
  
          <div
            className="
              mt-7
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {duration && (
              <DetailCard
                icon={CalendarDays}
                label="Duration"
                value={duration}
              />
            )}
  
            {idealFor && (
              <DetailCard
                icon={UserRoundCheck}
                label="Ideal For"
                value={idealFor}
              />
            )}
  
            {outcome && (
              <DetailCard
                icon={Target}
                label="Outcome"
                value={outcome}
              />
            )}
          </div>
        </div>
      </section>
    );
  }
  
  /* =========================================================
     DETAIL CARD
  ========================================================= */
  
  function DetailCard({
    icon: Icon,
    label,
    value,
  }) {
    return (
      <article
        className="
          rounded-[20px]
          border
          border-[#e0eaf4]
          bg-gradient-to-br
          from-white
          to-[#f8fbff]
          p-5
        "
      >
        <span
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-[14px]
            bg-[#edf6ff]
            text-[#075fc8]
          "
        >
          <Icon size={19} />
        </span>
  
        <p
          className="
            mt-4
            text-[10px]
            font-black
            uppercase
            tracking-[0.12em]
            text-[#f13873]
          "
        >
          {label}
        </p>
  
        <p
          className="
            mt-2
            whitespace-pre-line
            text-[13px]
            leading-6
            text-[#526581]
          "
        >
          {value}
        </p>
      </article>
    );
  }