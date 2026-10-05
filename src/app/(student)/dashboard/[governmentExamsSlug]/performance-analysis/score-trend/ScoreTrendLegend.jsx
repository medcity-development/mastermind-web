function shortTitle(
    value
) {
    const title =
        String(
            value || "Exam"
        );

    return title.length >
        24
        ? `${title.slice(
            0,
            21
        )}...`
        : title;
}

export default function ScoreTrendLegend({
    data = [],
}) {
    return (
        <div
            className="
        relative
        z-10

        border-t
        border-slate-100

        bg-[#fbfdff]

        px-5
        py-4
      "
        >
            <div
                className="
          grid
          gap-2

          sm:grid-cols-2
          xl:grid-cols-5
        "
            >
                {data.map(
                    (
                        attempt,
                        index
                    ) => (
                        <div
                            key={`${attempt.examType}-${attempt.attemptId}-legend`}
                            className="
                rounded-[13px]

                border
                border-slate-100

                bg-white

                px-3
                py-2.5
              "
                        >
                            <div
                                className="
                  flex
                  items-center
                  gap-2
                "
                            >
                                <span
                                    className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center

                    rounded-full

                    bg-blue-50

                    text-[8px]
                    font-black
                    text-[#017dc0]
                  "
                                >
                                    {index + 1}
                                </span>

                                <span
                                    className="
                    min-w-0
                    flex-1
                    truncate

                    text-[10px]
                    font-semibold
                    text-slate-500
                  "
                                    title={
                                        attempt.title
                                    }
                                >
                                    {shortTitle(
                                        attempt.title
                                    )}
                                </span>

                                <strong
                                    className="
                    text-[10px]
                    text-[#071f55]
                  "
                                >
                                    {
                                        attempt.percentage
                                    }
                                    %
                                </strong>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}