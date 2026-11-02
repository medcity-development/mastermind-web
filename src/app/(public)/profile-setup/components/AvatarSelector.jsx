// src/app/(public)/profile-setup/components/AvatarSelector.jsx

import Image from "next/image";

import {
  Check,
} from "lucide-react";

import maleAvatar from "../images/avatar-male.png";
import femaleAvatar from "../images/avatar-female.png";

export default function AvatarSelector({
  gender,
  onChange,
}) {
  return (
    <div className="w-full">
          <label
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              text-[#071b59]
              sm:text-[11px]
              lg:text-[13px]
            "
          >
            Choose your avatar
          </label>

          <div
            className="
              grid
              grid-cols-2
              gap-2.5
              sm:gap-3
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
        flex-row
        items-center
        justify-center
        gap-2.5
        overflow-hidden
        rounded-[14px]
        border
        px-2.5
        py-2
        lg:gap-3
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
          h-10
          w-10
          sm:h-12
          sm:w-12
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
          sm:text-xs
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