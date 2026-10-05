export function safeNumber(
    value,
    fallback = 0
) {
    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : fallback;
}

export function prepareChartData(
    attempts = []
) {
    return [...attempts]
        .reverse()
        .slice(-10)
        .map(
            (
                attempt,
                index
            ) => ({
                ...attempt,

                chartIndex:
                    index,

                percentage:
                    Math.max(
                        0,
                        Math.min(
                            100,
                            safeNumber(
                                attempt?.percentage
                            )
                        )
                    ),
            })
        );
}

export function getChartStats(
    chartData = []
) {
    if (!chartData.length) {
        return {
            latest: 0,
            average: 0,
            best: 0,
            change: 0,
        };
    }

    const latest =
        chartData[
            chartData.length - 1
        ]?.percentage ?? 0;

    const first =
        chartData[0]
            ?.percentage ?? 0;

    const average =
        Math.round(
            chartData.reduce(
                (
                    total,
                    attempt
                ) =>
                    total +
                    attempt.percentage,
                0
            ) /
            chartData.length
        );

    const best =
        Math.max(
            ...chartData.map(
                (attempt) =>
                    attempt.percentage
            )
        );

    return {
        latest,
        average,
        best,

        change:
            latest - first,
    };
}

export function buildChartGeometry(
    chartData
) {
    const width =
        1000;

    const height =
        330;

    const paddingLeft =
        58;

    const paddingRight =
        38;

    const paddingTop =
        45;

    const paddingBottom =
        60;

    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;

    const bottomY =
        paddingTop +
        chartHeight;

    const points =
        chartData.map(
            (
                item,
                index
            ) => {
                const x =
                    chartData.length ===
                        1
                        ? paddingLeft +
                        chartWidth / 2
                        : paddingLeft +
                        (index /
                            (chartData.length -
                                1)) *
                        chartWidth;

                const y =
                    paddingTop +
                    chartHeight -
                    (item.percentage /
                        100) *
                    chartHeight;

                return {
                    ...item,
                    x,
                    y,
                };
            }
        );

    const linePath =
        points
            .map(
                (
                    point,
                    index
                ) =>
                    `${index === 0
                        ? "M"
                        : "L"
                    } ${point.x} ${point.y}`
            )
            .join(" ");

    const firstPoint =
        points[0];

    const lastPoint =
        points[
        points.length - 1
        ];

    const areaPath =
        points.length
            ? `
        M ${firstPoint.x} ${bottomY}
        L ${firstPoint.x} ${firstPoint.y}

        ${points
                .slice(1)
                .map(
                    (point) =>
                        `L ${point.x} ${point.y}`
                )
                .join(" ")}

        L ${lastPoint.x} ${bottomY}
        Z
      `
            : "";

    return {
        width,
        height,

        paddingLeft,
        paddingRight,
        paddingTop,

        chartHeight,
        bottomY,

        points,
        linePath,
        areaPath,
    };
}