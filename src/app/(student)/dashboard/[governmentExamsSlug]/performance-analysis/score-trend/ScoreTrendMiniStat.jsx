export default function ScoreTrendMiniStat({
    label,
    value,
}) {
    return (
        <div
            className="
        min-w-[82px]

        rounded-[13px]

        border
        border-slate-200

        bg-white

        px-3
        py-2
      "
        >
            <p
                className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.1em]
          text-slate-400
        "
            >
                {label}
            </p>

            <p
                className="
          mt-0.5

          text-sm
          font-black

          text-[#071f55]
        "
            >
                {value}
            </p>
        </div>
    );
}