import {
  LogIn,
  Trophy,
} from "lucide-react";

export default function ScertLoginResultModal({
  open,
  message,
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
        z-[110]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-[26px]
          bg-white
          shadow-2xl
        "
      >
        <div
          className="
            bg-gradient-to-r
            from-[#071f55]
            via-[#075fc8]
            to-[#00a8df]
            px-6
            py-7
            text-center
            text-white
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
              rounded-2xl
              bg-white/15
            "
          >
            <Trophy
              size={27}
            />
          </div>

          <h2
            className="
              mt-4
              text-2xl
              font-black
            "
          >
            Exam Completed
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-blue-100
            "
          >
            {message ||
              "Login to view your result."}
          </p>
        </div>

        <div className="p-6">
          <p
            className="
              text-center
              text-sm
              leading-6
              text-slate-500
            "
          >
            Login to your MasterMind
            account to access your exam
            result and performance
            details.
          </p>

          <button
            type="button"
            onClick={
              onLogin
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
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
            <LogIn
              size={18}
            />

            Login to Get Result
          </button>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              mt-2
              w-full
              rounded-xl
              px-5
              py-3
              text-sm
              font-bold
              text-slate-500
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}