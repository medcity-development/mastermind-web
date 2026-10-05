import {
    CheckCircle2,
    XCircle,
} from "lucide-react";

import AccuracyCard from "./AccuracyCard";

export default function AccuracyGrid({
    summary,
}) {
    return (
        <div
            className="
        mt-6

        grid
        gap-4

        md:grid-cols-2
      "
        >
            <AccuracyCard
                icon={CheckCircle2}
                eyebrow="Correct responses"
                label="Accuracy Success"
                value={
                    summary?.totalCorrect ??
                    0
                }
                total={
                    summary?.totalAttempted ??
                    0
                }
                type="correct"
            />

            <AccuracyCard
                icon={XCircle}
                eyebrow="Incorrect responses"
                label="Needs Improvement"
                value={
                    summary?.totalWrong ??
                    0
                }
                total={
                    summary?.totalAttempted ??
                    0
                }
                type="wrong"
            />
        </div>
    );
}