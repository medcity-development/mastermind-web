"use client";

import {
  Crown,
  LockKeyhole,
  X,
  ArrowRight,
} from "lucide-react";

export default function PremiumExamModal({
  open,
  onClose,
  onLogin,
}) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-[#071f55]/70
        px-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[430px]
          rounded-[28px]
          bg-white
          p-7
          shadow-[0_30px_80px_rgba(7,31,85,0.3)]
        "
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full cursor-pointer
            bg-slate-100
            text-slate-500
            hover:bg-slate-200
          "
        >
          <X size={17} />
        </button>

        {/* ICON */}

        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-[20px]
            bg-amber-100
            text-amber-600
          "
        >
          <Crown size={28} />
        </div>

        {/* CONTENT */}

        <p
          className="
            mt-6
            text-[10px]
            font-black
            uppercase
            tracking-[0.14em]
            text-amber-600
          "
        >
          Premium Exam
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-black
            text-[#071f55]
          "
        >
          Purchase a plan to continue
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          This exam is available for
          premium users. Login to your
          account and purchase a plan to
          unlock this exam.
        </p>

        {/* INFO */}

        <div
          className="
            mt-6
            flex
            gap-3
            rounded-[16px]
            border
            border-amber-100
            bg-amber-50
            p-4
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              text-amber-600
            "
          >
            <LockKeyhole size={17} />
          </div>

          <div>
            <p
              className="
                text-xs
                font-black
                text-[#071f55]
              "
            >
              Premium access required
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              Login to view available
              plans and unlock premium
              exams.
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-[14px]
              border
              border-slate-200
              px-5
              py-3.5
              text-xs
              font-bold
              text-slate-600
              hover:bg-slate-50 cursor-pointer
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-gradient-to-r
              from-[#071f55]
              via-[#075fc8]
              to-[#017dc0] cursor-pointer
              px-5
              py-3.5
              text-xs
              font-black
              text-white
              shadow-lg
            "
          >
            OK, Login

            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}