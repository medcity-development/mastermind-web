"use client";

import ScoreTrendHeader from "./ScoreTrendHeader";
import ScoreTrendGraph from "./ScoreTrendGraph";
import ScoreTrendLegend from "./ScoreTrendLegend";
import ScoreTrendEmpty from "./ScoreTrendEmpty";

import {
    buildChartGeometry,
    getChartStats,
    prepareChartData,
} from "./scoreTrendUtils";

export default function ScoreTrendChart({
    attempts = [],
}) {
    const chartData =
        prepareChartData(
            attempts
        );

    if (
        !chartData.length
    ) {
        return (
            <ScoreTrendEmpty />
        );
    }

    const stats =
        getChartStats(
            chartData
        );

    const geometry =
        buildChartGeometry(
            chartData
        );

    return (
        <section
            className="
        relative
        mt-6
        overflow-hidden
        rounded-[28px]
        border
        border-[#dce8f7]
        bg-white
        shadow-[0_15px_45px_rgba(15,23,42,0.05)]
      "
        >
            <div
                className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.16]
          [background-image:linear-gradient(to_right,#dbeafe_1px,transparent_1px),linear-gradient(to_bottom,#dbeafe_1px,transparent_1px)]
          [background-size:30px_30px]
        "
            />

            <ScoreTrendHeader
                stats={
                    stats
                }
            />

            <ScoreTrendGraph
                geometry={
                    geometry
                }
            />

            <ScoreTrendLegend
                data={
                    chartData
                }
            />
        </section>
    );
}