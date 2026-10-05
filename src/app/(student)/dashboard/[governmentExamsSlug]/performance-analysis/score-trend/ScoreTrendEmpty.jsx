import {
    Activity,
} from "lucide-react";

export default function ScoreTrendEmpty() {
    return (
        <section
            className="
        mt-6

        rounded-[24px]

        border
        border-dashed
        border-slate-300

        bg-white

        px-6
        py-12

        text-center
      "
        >
            <Activity
                size={28}
                className="
          mx-auto
          text-slate-300
        "
            />

            <p
                className="
          mt-3
          text-sm
          font-bold
          text-slate-500
        "
            >
                No score data available.
            </p>
        </section>
    );
}