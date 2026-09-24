"use client";

import {
  LogIn,
  X,
} from "lucide-react";

export default function LoginRequiredModal({
  open,
  onClose,
  onLogin,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-slate-950/55
        px-4
        backdrop-blur-[4px]
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-[420px]
          overflow-hidden
          rounded-[24px]
          border
          border-white/20
          bg-white
          p-6
          shadow-[0_30px_80px_rgba(15,23,42,0.28)]
          sm:p-7
        "
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* BACKGROUND DECORATION */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-blue-100
            blur-3xl
          "
        />

        {/* CLOSE BUTTON */}

        <button
          type="button"
          aria-label="Close modal"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="
            absolute
            right-4
            top-4
            z-30
            flex
            h-9
            w-9
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-500
            transition-all
            duration-200
            hover:bg-slate-200
            hover:text-slate-800
          "
        >
          <X size={16} />
        </button>

        {/* CONTENT */}

        <div className="relative z-10">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[16px]
              bg-gradient-to-br
              from-[#0b216c]
              to-[#164fa5]
              text-white
              shadow-[0_10px_25px_rgba(22,79,165,0.25)]
            "
          >
            <LogIn size={23} />
          </div>

          <p
            className="
              mt-5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-[#017cc0]
            "
          >
            Account Required
          </p>

          <h2
            className="
              mt-1
              text-[22px]
              font-extrabold
              text-[#0b1f44]
            "
          >
            Login with us
          </h2>

          <p
            className="
              mt-2
              text-[13px]
              leading-6
              text-slate-500
            "
          >
            Please login to save your exam
            result and continue with your
            account.
          </p>

          <button
            type="button"
            onClick={onLogin}
            className="
              mt-6
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-[13px]
              bg-gradient-to-r
              from-[#0b216c]
              via-[#164fa5]
              to-[#017cc0]
              px-5
              py-3.5
              text-[12px]
              font-bold
              text-white
              shadow-[0_12px_28px_rgba(22,79,165,0.24)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_16px_34px_rgba(22,79,165,0.30)]
            "
          >
            <LogIn size={15} />

            OK, Login
          </button>
        </div>
      </div>
    </div>
  );
}