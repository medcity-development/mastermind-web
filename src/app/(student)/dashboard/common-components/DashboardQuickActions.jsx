import {
  getHomeResponses,
} from "@/lib/pscApi";

import {
  prepareDashboardLearningTools,
} from "./quick-actions/dashboardLearningToolsHelper";

import DashboardQuickActionCard from "./quick-actions/DashboardQuickActionCard";

export default async function DashboardQuickActions({
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
      "DASHBOARD QUICK ACTIONS API ERROR:",
      error
    );

    return null;
  }

  const items =
    prepareDashboardLearningTools({
      grid:
        response?.grid,

      governmentExamsSlug:
        config.slug,
    });

  console.log(
    "DASHBOARD QUICK ACTIONS:",
    {
      cid:
        config.cid,

      slug:
        config.slug,

      apiGrid:
        response?.grid,

      items,
    }
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-[#dcebf7]

        bg-white

        p-4

        shadow-[0_14px_40px_rgba(15,58,110,0.07)]

        sm:p-5
        lg:p-6
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
          to-[#f4f8ff]
        "
      />

      {/* CYAN GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24

          h-[260px]
          w-[260px]

          rounded-full

          bg-cyan-400/[0.06]

          blur-[90px]
        "
      />

      {/* VIOLET GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-28
          -left-24

          h-[260px]
          w-[260px]

          rounded-full

          bg-violet-400/[0.05]

          blur-[90px]
        "
      />

      {/* HEADER */}

      <div
        className="
          relative
          z-10
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

      {/* GRID */}

      <div
        className="
          relative
          z-10

          mt-5

          grid
          grid-cols-2
          gap-3

          sm:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-7
        "
      >
        {items.map((item) => (
          <DashboardQuickActionCard
            key={
              item?.id ??
              item.title
            }
            item={item}
          />
        ))}
      </div>
    </section>
  );
}