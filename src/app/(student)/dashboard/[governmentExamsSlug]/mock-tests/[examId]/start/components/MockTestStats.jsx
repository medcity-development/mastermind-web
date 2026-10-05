export default function MockTestStats({
    questionsCount,
    totalMark,
    answeredCount,
    unansweredCount,
}) {
    const items = [
        {
            label: "Questions",
            value:
                questionsCount,
        },
        {
            label: "Marks",
            value:
                totalMark,
        },
        {
            label: "Answered",
            value:
                answeredCount,
        },
        {
            label: "Remaining",
            value:
                unansweredCount,
        },
    ];

    return (
        <div
            className="
        grid
        grid-cols-2
        gap-3
        border-b
        border-slate-100
        bg-[#f8fbff]
        px-5
        py-4
        sm:grid-cols-4
        sm:px-7
      "
        >
            {items.map(
                (item) => (
                    <StatBox
                        key={
                            item.label
                        }
                        {...item}
                    />
                )
            )}
        </div>
    );
}

function StatBox({
    label,
    value,
}) {
    return (
        <div
            className="
        rounded-xl
        border
        border-slate-100
        bg-white
        px-4
        py-3
      "
        >
            <p
                className="
          text-[17px]
          font-black
          text-[#071f55]
        "
            >
                {value}
            </p>

            <p
                className="
          mt-1
          text-[9px]
          font-bold
          uppercase
          tracking-[0.06em]
          text-slate-400
        "
            >
                {label}
            </p>
        </div>
    );
}