export default function ScoreTrendGraph({
    geometry,
}) {
    const {
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
    } = geometry;

    const yTicks = [
        100,
        75,
        50,
        25,
        0,
    ];

    return (
        <div
            className="
        relative
        z-10

        overflow-x-auto

        px-4
        py-5
      "
        >
            <div
                className="
          min-w-[760px]

          rounded-[22px]

          border
          border-[#e5edf7]

          bg-[#fbfdff]

          p-4
        "
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="
            h-auto
            w-full
          "
                >
                    <defs>
                        <linearGradient
                            id="scoreArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#017dc0"
                                stopOpacity="0.24"
                            />

                            <stop
                                offset="100%"
                                stopColor="#017dc0"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <linearGradient
                            id="scoreLine"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop
                                offset="0%"
                                stopColor="#164fa5"
                            />

                            <stop
                                offset="55%"
                                stopColor="#017dc0"
                            />

                            <stop
                                offset="100%"
                                stopColor="#7c3aed"
                            />
                        </linearGradient>
                    </defs>

                    {yTicks.map(
                        (tick) => {
                            const y =
                                paddingTop +
                                chartHeight -
                                (tick /
                                    100) *
                                chartHeight;

                            return (
                                <g
                                    key={tick}
                                >
                                    <line
                                        x1={
                                            paddingLeft
                                        }
                                        x2={
                                            width -
                                            paddingRight
                                        }
                                        y1={y}
                                        y2={y}
                                        stroke="#e8eef6"
                                        strokeDasharray="5 5"
                                    />

                                    <text
                                        x={
                                            paddingLeft -
                                            12
                                        }
                                        y={
                                            y + 4
                                        }
                                        textAnchor="end"
                                        fontSize="10"
                                        fontWeight="700"
                                        fill="#94a3b8"
                                    >
                                        {tick}%
                                    </text>
                                </g>
                            );
                        }
                    )}

                    <path
                        d={areaPath}
                        fill="url(#scoreArea)"
                    />

                    <path
                        d={linePath}
                        fill="none"
                        stroke="url(#scoreLine)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {points.map(
                        (
                            point,
                            index
                        ) => (
                            <g
                                key={`${point.examType}-${point.attemptId}`}
                            >
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="8"
                                    fill="#ffffff"
                                    stroke="#017dc0"
                                    strokeWidth="3"
                                />

                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="3"
                                    fill="#017dc0"
                                />

                                <text
                                    x={point.x}
                                    y={
                                        point.y -
                                        16
                                    }
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="900"
                                    fill="#071f55"
                                >
                                    {
                                        point.percentage
                                    }
                                    %
                                </text>

                                <text
                                    x={point.x}
                                    y={
                                        height -
                                        24
                                    }
                                    textAnchor="middle"
                                    fontSize="9"
                                    fontWeight="700"
                                    fill="#64748b"
                                >
                                    {index + 1}
                                </text>
                            </g>
                        )
                    )}
                </svg>
            </div>
        </div>
    );
}