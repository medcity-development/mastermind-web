import { FileQuestion } from "lucide-react";

export default function ExamEmpty() {
  return (
    <div
      className="
        overflow-hidden
        rounded-[26px]
        border
        border-dashed
        border-slate-300
        bg-white
        px-5
        py-16
        text-center
        shadow-[0_18px_50px_rgba(15,23,42,0.06)]
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
          bg-blue-50
          text-[#164fa5]
        "
      >
        <FileQuestion size={24} />
      </div>

      <h2
        className="
          mt-4
          text-[19px]
          font-extrabold
          text-[#0b1f44]
        "
      >
        Questions not available
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-[480px]
          text-[13px]
          leading-6
          text-slate-500
        "
      >
        No questions were returned for this
        exam.
      </p>
    </div>
  );
}