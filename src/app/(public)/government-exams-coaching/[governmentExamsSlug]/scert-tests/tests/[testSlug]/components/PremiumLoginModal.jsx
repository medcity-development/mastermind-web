"use client";

import {
  useRouter,
} from "next/navigation";

import {
  Crown,
  LockKeyhole,
  X,
} from "lucide-react";

export default function PremiumLoginModal({
  open,
  onClose,
  redirectPath = "",
}) {
  const router =
    useRouter();

  if (!open) {
    return null;
  }

  function handleLogin() {
    const redirect =
      encodeURIComponent(
        redirectPath
      );

    router.push(
      `/login?redirect=${redirect}`
    );
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#020817]/65
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[440px]
          overflow-hidden
          rounded-[28px]
          bg-white
          p-7
          shadow-2xl
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-600
          "
        >
          <X size={17} />
        </button>

        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-amber-100
            to-orange-100
            text-amber-600
          "
        >
          <Crown size={29} />
        </div>

        <h2
          className="
            mt-5
            text-2xl
            font-black
            text-[#071f55]
          "
        >
          Premium SCERT Test
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-slate-500
          "
        >
          Login with us and
          purchase an active plan
          to access this premium
          SCERT test.
        </p>

        <div
          className="
            mt-5
            flex
            items-center
            gap-3
            rounded-xl
            bg-[#f5f9ff]
            p-4
          "
        >
          <LockKeyhole
            size={19}
            className="text-[#075fc8]"
          />

          <p
            className="
              text-sm
              font-semibold
              text-slate-600
            "
          >
            Login required for
            premium content
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleLogin
          }
          className="
            mt-6
            w-full
            rounded-xl
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#017dc0]
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
          "
        >
          Login & View Plans
        </button>
      </div>
    </div>
  );
}