import {
    LogIn,
    X,
  } from "lucide-react";
  
  export default function LoginRequiredModal({
    open,
    action,
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
          z-[99999]
          flex
          items-center
          justify-center
          bg-[#071f55]/50
          px-4
          backdrop-blur-sm
        "
      >
        <div
          className="
            relative
            w-full
            max-w-[430px]
            rounded-[26px]
            bg-white
            p-7
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
            "
          >
            <X size={17} />
          </button>
  
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              bg-blue-50
              text-[#075fc8]
            "
          >
            <LogIn
              size={23}
            />
          </div>
  
          <p
            className="
              mt-5
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[#017dc0]
            "
          >
            Login Required
          </p>
  
          <h2
            className="
              mt-2
              text-2xl
              font-black
              text-[#071f55]
            "
          >
            Login with us
          </h2>
  
          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-500
            "
          >
            Please login to{" "}
            {action === "pause"
              ? "pause and save"
              : "finish and save"}{" "}
            your exam attempt.
          </p>
  
          <div
            className="
              mt-7
              flex
              justify-end
              gap-3
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-[13px]
                border
                border-slate-200
                px-5
                py-3
                text-sm
                font-bold
                text-slate-600
              "
            >
              Cancel
            </button>
  
            <button
              type="button"
              onClick={onLogin}
              className="
                rounded-[13px]
                bg-[#075fc8]
                px-5
                py-3
                text-sm
                font-bold
                text-white
              "
            >
              OK, Login
            </button>
          </div>
        </div>
      </div>
    );
  }