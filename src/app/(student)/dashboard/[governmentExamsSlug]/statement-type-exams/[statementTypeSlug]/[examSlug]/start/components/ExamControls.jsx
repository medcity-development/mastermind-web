import {
    CheckCircle2,
    Pause,
  } from "lucide-react";
  
  export default function ExamControls({
    onPause,
    onFinish,
  }) {
    return (
      <section
        className="
          mt-7
          rounded-[22px]
          border
          border-slate-200
          bg-white
          p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="font-black text-[#071f55]">
              Exam Controls
            </p>
  
            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Pause or finish your
              current exam attempt.
            </p>
          </div>
  
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <button
              type="button"
              onClick={onPause}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-[14px]
                border
                border-amber-200
                bg-amber-50
                px-5
                py-3
                text-sm
                font-bold
                text-amber-700
              "
            >
              <Pause size={16} />
  
              Pause Exam
            </button>
  
            <button
              type="button"
              onClick={onFinish}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-gradient-to-r
                from-[#075fc8]
                via-[#6366f1]
                to-[#7c3aed]
                px-5
                py-3
                text-sm
                font-bold
                text-white
              "
            >
              <CheckCircle2
                size={16}
              />
  
              Finish Exam
            </button>
          </div>
        </div>
      </section>
    );
  }