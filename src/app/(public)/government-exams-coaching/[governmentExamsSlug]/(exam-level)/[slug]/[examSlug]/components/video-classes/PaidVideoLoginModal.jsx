"use client";

import Link from "next/link";

import {
  LockKeyhole,
  LogIn,
  X,
} from "lucide-react";

export default function PaidVideoLoginModal({
  open = false,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[999]
        flex
        items-center
        justify-center
        bg-slate-950/55
        px-4
        backdrop-blur-[3px]
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[26px]
          border
          border-white/10
          bg-white
          shadow-[0_30px_80px_rgba(0,0,0,0.30)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* TOP */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#071f55]
            via-[#075fc8]
            to-[#7c3aed]
            px-6
            py-8
            text-center
            text-white
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              opacity-[0.07]
              [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              [background-size:28px_28px]
            "
          />

          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              transition
              hover:bg-white/20
            "
          >
            <X size={17} />
          </button>

          <div
            className="
              relative
              z-10
            "
          >
            <span
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                border
                border-white/15
                bg-white/10
                backdrop-blur
              "
            >
              <LockKeyhole
                size={28}
              />
            </span>

            <p
              className="
                mt-5
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-cyan-200
              "
            >
              Premium Lesson
            </p>

            <h2
              className="
                mt-2
                text-xl
                font-black
              "
            >
              Login to Continue
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-[12px]
                leading-6
                text-white/75
              "
            >
              Your free preview has ended.
              Login to continue watching
              this premium video lesson.
            </p>
          </div>
        </div>

        {/* BODY */}

        <div
          className="
            p-6
          "
        >
          <Link
            href="/login"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-[14px]
              bg-gradient-to-r
              from-[#075fc8]
              to-[#164fa5]
              px-5
              py-3.5
              text-[12px]
              font-black
              text-white
              shadow-[0_10px_25px_rgba(22,79,165,0.22)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_16px_32px_rgba(22,79,165,0.28)]
            "
          >
            <LogIn size={16} />
            Login
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="
              mt-3
              w-full
              rounded-[14px]
              border
              border-slate-200
              bg-white
              px-5
              py-3.5
              text-[11px]
              font-bold
              text-slate-600
              transition
              hover:bg-slate-50
            "
          >
            Continue Preview Later
          </button>
        </div>
      </div>
    </div>
  );
}