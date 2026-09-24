import { Brain } from "lucide-react";

export default function QuizEmpty() {
  return (
    <div
      className="
        flex
        min-h-[250px]
        flex-col
        items-center
        justify-center
        rounded-[22px]
        border
        border-dashed
        border-[#cadbef]
        bg-[#f8fbff]
        px-5
        text-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-[#e7f2ff]
          text-[#087bea]
        "
      >
        <Brain size={24} />
      </div>

      <h3
        className="
          mt-4
          font-black
          text-[#102c5c]
        "
      >
        No quizzes available
      </h3>

      <p
        className="
          mt-2
          max-w-[350px]
          text-xs
          leading-5
          text-slate-500
        "
      >
        No Current Affairs quizzes are
        currently available.
      </p>
    </div>
  );
}