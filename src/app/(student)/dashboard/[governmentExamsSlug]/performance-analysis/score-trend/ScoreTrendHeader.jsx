import {
    TrendingUp,
} from "lucide-react";

import ScoreTrendMiniStat from "./ScoreTrendMiniStat";

export default function ScoreTrendHeader({
    stats,
}) {
    return (
        <header
            className="
        relative
        z-10

        flex
        flex-col
        gap-4

        border-b
        border-slate-100

        bg-white/80

        px-5
        py-5

        backdrop-blur-xl

        sm:flex-row
        sm:items-center
        sm:justify-between
      "
        >
            <div
                className="
          flex
          items-center
          gap-3
        "
            >
                <div
                    className="
            flex
            h-11
            w-11
            items-center
            justify-center

            rounded-[14px]

            bg-gradient-to-br
            from-[#164fa5]
            to-[#017dc0]

            text-white
          "
                >
                    <TrendingUp
                        size={19}
                    />
                </div>

                <div>
                    <p
                        className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
                    >
                        Performance
                    </p>

                    <h2
                        className="
              text-lg
              font-black
              text-[#071f55]
            "
                    >
                        Score Progress
                    </h2>
                </div>
            </div>

            <div
                className="
          flex
          flex-wrap
          gap-2
        "
            >
                <ScoreTrendMiniStat
                    label="Latest"
                    value={`${stats.latest}%`}
                />

                <ScoreTrendMiniStat
                    label="Average"
                    value={`${stats.average}%`}
                />

                <ScoreTrendMiniStat
                    label="Best"
                    value={`${stats.best}%`}
                />

                <ScoreTrendMiniStat
                    label="Change"
                    value={`${stats.change > 0
                            ? "+"
                            : ""
                        }${stats.change}%`}
                />
            </div>
        </header>
    );
}