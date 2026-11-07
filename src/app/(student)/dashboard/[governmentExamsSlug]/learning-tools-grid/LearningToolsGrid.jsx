import {
  getHomeResponses,
} from "@/lib/pscApi";

import {
  prepareDashboardLearningTools,
} from "../../common-components/quick-actions/dashboardLearningToolsHelper";

import LearningToolCard from "./LearningToolCard";
import styles from "./LearningToolsGrid.module.css";

export default async function LearningToolsGrid({
  config,
  uid = 0,
}) {
  if (!config) {
    return null;
  }

  let response = null;

  try {
    response =
      await getHomeResponses({
        cid: config.cid,
        uid,
      });
  } catch (error) {
    console.error(
      "DASHBOARD LEARNING TOOLS API ERROR:",
      error
    );

    return null;
  }

  const learningTools =
    prepareDashboardLearningTools({
      grid:
        response?.grid,
      governmentExamsSlug:
        config.slug,
    });

  if (
    learningTools.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="dashboard-learning-tools"
      className={`relative w-full min-w-0 ${styles.container}`}
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

        <div
          className="
            relative
            z-10
            mb-5
          "
        >
          <p
            className="
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[#2584e8]
            "
          >
            Learning Tools
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
            Quick Actions
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Everything you need for your{" "}
            {config.shortName} preparation
            inside your dashboard.
          </p>
        </div>

        <div className={`relative z-10 ${styles.grid}`}>
          {learningTools.map((item) => (
            <LearningToolCard
              key={item?.id ?? item.title}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
