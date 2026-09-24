"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  Crown,
  LogIn,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createPortal,
} from "react-dom";

export default function PremiumStatementExamButton() {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    mounted,
    setMounted,
  ] = useState(false);

  /* =========================================================
     CLIENT MOUNT
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =========================================================
     LOCK BODY SCROLL
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleLogin() {
    router.push(
      "/login"
    );
  }

  /* =========================================================
     MODAL
  ========================================================= */

  const modal =
    open && mounted ? (
      <div
        className="
          fixed
          inset-0
          z-[99999]
          flex
          items-center
          justify-center
          bg-[#071f55]/45
          px-4
          backdrop-blur-[3px]
        "
        onClick={() =>
          setOpen(false)
        }
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="premium-statement-title"
          className="
            relative
            w-full
            max-w-[430px]
            overflow-hidden
            rounded-[26px]
            border
            border-amber-100
            bg-white
            p-7
            shadow-[0_30px_90px_rgba(7,31,85,0.28)]
          "
          onClick={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          {/* SOFT AMBER GLOW */}

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
              bg-amber-100/70
              blur-3xl
            "
          />

          {/* CLOSE */}

          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setOpen(false)
            }
            className="
              absolute
              right-4
              top-4
              z-10
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-slate-500
              transition-all
              hover:bg-slate-200
            "
          >
            <X
              size={17}
            />
          </button>

          {/* ICON */}

          <div
            className="
              relative
              z-10
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[18px]
              border
              border-amber-200
              bg-amber-50
              text-amber-600
            "
          >
            <Crown
              size={24}
            />
          </div>

          {/* CONTENT */}

          <div
            className="
              relative
              z-10
            "
          >
            <p
              className="
                mt-5
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
              id="premium-statement-title"
              className="
                mt-2
                text-2xl
                font-black
                text-[#071f55]
              "
            >
              Get a Plan
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              This statement type exam
              is available for premium
              users. Login with us to
              continue and choose a plan.
            </p>

            {/* ACTIONS */}

            <div
              className="
                mt-7
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-[13px]
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-slate-600
                  transition-all
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleLogin
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-[13px]
                  border
                  border-amber-200
                  bg-amber-100
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-amber-800
                  shadow-[0_8px_20px_rgba(245,158,11,0.10)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-amber-200
                "
              >
                <LogIn
                  size={16}
                />

                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* PREMIUM BUTTON */}

      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="
          mt-auto
          w-full
          pt-6
        "
      >
        <span
          className="
            inline-flex
            w-full
            items-center
            justify-between
            rounded-[14px]
            border
            border-amber-200
            bg-amber-50
            px-5
            py-3.5
            text-[11px]
            font-bold
            text-amber-700
            shadow-[0_6px_18px_rgba(245,158,11,0.06)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-amber-100
          "
        >
          <span>
            View Exam
          </span>

          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-amber-100
              text-amber-700
              transition-all
              duration-300
              group-hover:translate-x-1
            "
          >
            <ArrowRight
              size={14}
            />
          </span>
        </span>
      </button>

      {mounted &&
        modal &&
        createPortal(
          modal,
          document.body
        )}
    </>
  );
}