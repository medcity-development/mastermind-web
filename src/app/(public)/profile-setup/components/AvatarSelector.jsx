// src/app/(public)/profile-setup/components/AvatarSelector.jsx

import Image from "next/image";

import {
  Check,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import maleAvatar from "../images/avatar-male.png";
import femaleAvatar from "../images/avatar-female.png";

export default function AvatarSelector({
  gender,
  onChange,
}) {
  return (
    <div
        className="
          grid
          gap-4
          lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]
          lg:gap-5
        "
      >
        <div>
          <label
            className="
              mb-1
              block
              text-[11px]
              font-bold
              text-[#071b59]
              lg:text-[13px]
            "
          >
            Choose your avatar
          </label>

          <div
            className="
              grid
              grid-cols-2
              gap-2
              lg:gap-3
            "
          >
            <AvatarOption
              label="Male"
              image={maleAvatar}
              selected={
                gender === "male"
              }
              onClick={() =>
                onChange("male")
              }
            />

            <AvatarOption
              label="Female"
              image={femaleAvatar}
              selected={
                gender === "female"
              }
              onClick={() =>
                onChange("female")
              }
            />
          </div>
        </div>

        <div
          className="
            relative
            hidden
            min-h-[148px]
            overflow-hidden
            rounded-2xl
            bg-gradient-to-br
            from-[#0b216c]
            via-[#123c91]
            to-[#315ff4]
            p-4
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-8
              -top-12
              h-36
              w-36
              rounded-full
              border
              border-white/10
              bg-white/5
            "
          />
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-20
              -right-2
              h-40
              w-40
              rounded-full
              border
              border-white/10
            "
          />

          <div className="relative flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-blue-100 ring-1 ring-white/15">
              <GraduationCap size={19} />
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100">
              <Sparkles size={11} />
              Your journey
            </span>
          </div>

          <div className="relative mt-3">
            <h3 className="text-[15px] font-bold tracking-tight">
              Make this space yours
            </h3>
            <p className="mt-1 max-w-[280px] text-[10px] leading-[1.6] text-blue-100/85">
              Your profile helps us shape a learning experience around you.
            </p>
          </div>

          <div className="relative mt-3 flex items-center gap-2 border-t border-white/15 pt-2.5 text-[10px] font-medium text-blue-50">
            <ShieldCheck size={14} className="shrink-0 text-cyan-200" />
            Your details stay safe and secure
          </div>
        </div>
      </div>
  );
}

function AvatarOption({
  label,
  image,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        flex
        flex-col
        items-center
        justify-center
        gap-2
        overflow-hidden
        rounded-2xl
        border
        px-3
        py-2
        lg:gap-2.5
        lg:px-4
        lg:py-3
        text-center
        transition-all
        duration-300

        ${
          selected
            ? `
              border-blue-400
              bg-gradient-to-br
              from-blue-50
              to-indigo-50
              shadow-[0_8px_24px_rgba(37,99,235,0.12)]
              ring-1
              ring-blue-200
            `
            : `
              border-slate-200
              bg-white/80
              hover:-translate-y-0.5
              hover:border-blue-200
              hover:bg-white
              hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]
            `
        }
      `}
    >
      {/* AVATAR */}

      <div
        className={`
          relative
          h-[48px]
          w-[48px]
          lg:h-[64px]
          lg:w-[64px]
          shrink-0
          overflow-hidden
          rounded-full
          border-2
          bg-white
          transition-all
          duration-300

          ${
            selected
              ? `
                  border-blue-500
                  shadow-[0_6px_18px_rgba(37,99,235,0.2)]
                `
              : `
                  border-slate-100
                `
          }
        `}
      >
        <Image
          src={image}
          alt={`${label} avatar`}
          width={130}
          height={130}
          className="
            block
            h-full
            w-full
            object-cover
            object-center
          "
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* LABEL */}

      <span
        className="
          text-[11px]
          font-bold
          text-slate-700
          lg:text-[13px]
        "
      >
        {label}
      </span>

      {/* SELECTED CHECK */}

      {selected && (
        <span
          className="
            absolute
            right-2
            top-2
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-[#2468f2]
            text-white
            shadow-[0_6px_14px_rgba(36,104,242,0.25)]
          "
        >
          <Check
            size={12}
            strokeWidth={3}
          />
        </span>
      )}
    </button>
  );
}