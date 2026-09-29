import {
  Flag,
  LoaderCircle,
} from "lucide-react";

export default function ScertFinishModal({
  open,
  saving,
  attempted,
  totalQuestions,
  onClose,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  const unanswered =
    Math.max(
      totalQuestions -
        attempted,
      0
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-[24px]
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-[#075fc8]
          "
        >
          <Flag
            size={22}
          />
        </div>

        <h2
          className="
            mt-5
            text-xl
            font-black
            text-[#071f55]
          "
        >
          Finish exam?
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          You have answered{" "}
          <strong>
            {attempted}
          </strong>{" "}
          of{" "}
          <strong>
            {
              totalQuestions
            }
          </strong>{" "}
          questions.
        </p>

        {unanswered >
          0 && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              p-4
              text-sm
              font-medium
              text-amber-700
            "
          >
            {
              unanswered
            }{" "}
            question
            {unanswered !==
            1
              ? "s"
              : ""}{" "}
            remain unanswered.
          </div>
        )}

        <div
          className="
            mt-6
            flex
            gap-3
          "
        >
          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="
              flex-1
              rounded-xl
              border
              border-slate-200
              px-4
              py-3
              text-sm
              font-bold
              text-slate-600
            "
          >
            Continue
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onConfirm
            }
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#071f55]
              to-[#075fc8]
              px-4
              py-3
              text-sm
              font-bold
              text-white
              disabled:opacity-50
            "
          >
            {saving && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            Finish Exam
          </button>
        </div>
      </div>
    </div>
  );
}