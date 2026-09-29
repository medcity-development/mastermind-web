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
          mt-6
          rounded-[22px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_8px_25px_rgba(22,79,165,0.05)]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-black
                text-[#071f55]
              "
            >
              Exam Controls
            </p>
  
            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Pause your exam or
              finish your attempt.
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
                min-w-[145px]
                items-center
                justify-center
                gap-2
                rounded-[13px]
                border
                border-amber-200
                bg-amber-50
                px-5
                py-3.5
                text-sm
                font-bold
                text-amber-700
                transition
                hover:bg-amber-100
              "
            >
              <Pause
                size={17}
              />
  
              Pause Exam
            </button>
  
            <button
              type="button"
              onClick={onFinish}
              className="
                inline-flex
                min-w-[145px]
                items-center
                justify-center
                gap-2
                rounded-[13px]
                bg-gradient-to-r
                from-[#071f55]
                via-[#075fc8]
                to-[#017dc0]
                px-5
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(7,95,200,0.18)]
              "
            >
              <CheckCircle2
                size={17}
              />
  
              Finish Exam
            </button>
          </div>
        </div>
      </section>
    );
  }