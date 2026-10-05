import {
    Activity,
    CheckCircle2,
    Target,
    Trophy,
} from "lucide-react";

import PerformanceSummaryCard from "./PerformanceSummaryCard";

export default function PerformanceSummaryGrid({
    summary,
}) {
    return (
        <div
            className="
        mt-6
        grid
        gap-4

        sm:grid-cols-2
        xl:grid-cols-4
      "
        >
            <PerformanceSummaryCard
                icon={Trophy}
                label="Tests Attempted"
                value={
                    summary?.tests ?? 0
                }
                description="Saved exam attempts"
                tone="
          bg-blue-50
          text-[#075fc8]
        "
            />

            <PerformanceSummaryCard
                icon={Target}
                label="Questions Attempted"
                value={
                    summary
                        ?.totalAttempted ??
                    0
                }
                description="Questions answered"
                tone="
          bg-violet-50
          text-violet-600
        "
            />

            <PerformanceSummaryCard
                icon={CheckCircle2}
                label="Correct Answers"
                value={
                    summary
                        ?.totalCorrect ??
                    0
                }
                description="Total correct responses"
                tone="
          bg-emerald-50
          text-emerald-600
        "
            />

            <PerformanceSummaryCard
                icon={Activity}
                label="Average Score"
                value={`${summary?.averageScore ?? 0}%`}
                description="Across completed attempts"
                tone="
          bg-amber-50
          text-amber-600
        "
            />
        </div>
    );
}