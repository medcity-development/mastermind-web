import {
  getHomeResponses,
} from "@/lib/pscApi";

import LearningToolCard from "./LearningToolCard";

import {
  DEFAULT_LEARNING_TOOL_META,
  getLearningToolMeta,
} from "./learningToolsData";

/* =========================================================
   BUILD BASE PATH

   kerala-psc
   ->
   /government-exams-coaching/kerala-psc

   rrb-ssc
   ->
   /government-exams-coaching/rrb-ssc
========================================================= */

function buildBasePath(
  governmentExamsSlug
) {
  if (
    !governmentExamsSlug
  ) {
    return "";
  }

  return `/government-exams-coaching/${governmentExamsSlug}`;
}

/* =========================================================
   PREPARE API ITEM
========================================================= */

function prepareLearningTool({
  item,
  governmentExamsSlug,
}) {
  const title =
    String(
      item?.title ??
        ""
    ).trim();

  if (!title) {
    return null;
  }

  /* =======================================================
     RESOLVE META FROM API TITLE
  ======================================================= */

  const matchedMeta =
    getLearningToolMeta(
      title
    );

  const meta =
    matchedMeta ||
    DEFAULT_LEARNING_TOOL_META;

  const basePath =
    buildBasePath(
      governmentExamsSlug
    );

  /* =======================================================
     IMPORTANT

     Only build child URL when an actual registered
     application route exists.

     Never create URL from API title automatically.
  ======================================================= */

  const href =
    meta.route
      ? `${basePath}/${meta.route}`
      : basePath;

  return {
    ...item,

    title,

    subtitle:
      meta.subtitle,

    route:
      meta.route,

    href,

    icon:
      meta.icon,

    iconColor:
      meta.iconColor,

    iconBg:
      meta.iconBg,

    hasRegisteredRoute:
      Boolean(
        matchedMeta?.route
      ),
  };
}

/* =========================================================
   LEARNING TOOLS GRID
========================================================= */

export default async function LearningToolsGrid({
  cid,
  examName,
  governmentExamsSlug,
}) {
  let response;

  /* =======================================================
     FETCH DYNAMIC GRID

     cid 1 -> Kerala PSC
     cid 2 -> RRB & SSC
  ======================================================= */

  try {
    response =
      await getHomeResponses({
        cid,
        uid: 0,
      });
  } catch (error) {
    console.error(
      `Unable to load learning tools for ${examName}:`,
      error
    );

    return null;
  }

  /* =======================================================
     FORMAT API DATA
  ======================================================= */

  const learningTools =
    Array.isArray(
      response?.grid
    )
      ? response.grid
          .filter(
            (item) =>
              String(
                item?.status ??
                  "1"
              ) === "1"
          )
          .sort(
            (a, b) =>
              Number(
                a?.order ??
                  0
              ) -
              Number(
                b?.order ??
                  0
              )
          )
          .map(
            (item) =>
              prepareLearningTool({
                item,
                governmentExamsSlug,
              })
          )
          .filter(Boolean)
      : [];

  if (
    learningTools.length ===
    0
  ) {
    return null;
  }

  /* =======================================================
     DESKTOP ROWS
  ======================================================= */

  const firstRow =
    learningTools.slice(
      0,
      5
    );

  const secondRow =
    learningTools.slice(
      5
    );

  return (
    <section
      className="
        relative
        w-full
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-[#dcebf7]
            bg-white
            p-3
            shadow-[0_14px_40px_rgba(15,58,110,0.07)]
            sm:p-4
            lg:p-5
          "
        >
          {/* BACKGROUND */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-[#fbfdff]
              via-white
              to-[#f3f9ff]
            "
          />

          {/* GLOW */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -top-24
              left-1/2
              h-[220px]
              w-[60%]
              -translate-x-1/2
              rounded-full
              bg-[#00b5e8]/[0.05]
              blur-[90px]
            "
          />

          {/* ==============================================
              MOBILE / TABLET
          ============================================== */}

          <div
            className="
              relative
              z-10
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              lg:hidden
            "
          >
            {learningTools.map(
              (item) => (
                <LearningToolCard
                  key={
                    item?.id ??
                    item.title
                  }
                  item={item}
                />
              )
            )}
          </div>

          {/* ==============================================
              DESKTOP
          ============================================== */}

          <div
            className="
              relative
              z-10
              hidden
              space-y-3
              lg:block
            "
          >
            {/* FIRST ROW */}

            <div
              className="
                grid
                grid-cols-5
                gap-3
              "
            >
              {firstRow.map(
                (item) => (
                  <LearningToolCard
                    key={
                      item?.id ??
                      item.title
                    }
                    item={item}
                  />
                )
              )}
            </div>

            {/* SECOND ROW */}

            {secondRow.length >
              0 && (
              <div
                className="
                  grid
                  gap-3
                "
                style={{
                  gridTemplateColumns:
                    `repeat(${Math.min(
                      secondRow.length,
                      7
                    )}, minmax(0, 1fr))`,
                }}
              >
                {secondRow.map(
                  (item) => (
                    <LearningToolCard
                      key={
                        item?.id ??
                        item.title
                      }
                      item={item}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}