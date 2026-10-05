import {
    History,
} from "lucide-react";

export default function ExamHistoryEmpty() {
    return (
        <div
            className="
        px-6
        py-16
        text-center
      "
        >
            <div
                className="
          mx-auto

          flex
          h-14
          w-14
          items-center
          justify-center

          rounded-[18px]

          bg-slate-50

          text-slate-300
        "
            >
                <History
                    size={24}
                />
            </div>

            <p
                className="
          mt-4
          text-sm
          font-extrabold
          text-[#071f55]
        "
            >
                No exam attempts yet
            </p>

            <p
                className="
          mt-1
          text-[10px]
          text-slate-400
        "
            >
                Completed exams will
                appear in your history.
            </p>
        </div>
    );
}