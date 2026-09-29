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
    <div>
      <label
        className="
          mb-2
          block
          text-[12px]
          font-bold
          text-[#071b59]
        "
      >
        Choose Avatar
      </label>

      <div
        className="
          grid
          grid-cols-2
          gap-3
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
        flex-col
        items-center
        justify-center
        gap-2
        overflow-hidden
        rounded-[18px]
        border
        px-3
        py-4
        text-center
        transition-all
        duration-300

        ${
          selected
            ? `
                border-[#4f6cf7]
                bg-gradient-to-b
                from-[#eef4ff]
                to-[#f8faff]
                shadow-[0_0_0_3px_rgba(79,108,247,0.08)]
              `
            : `
                border-slate-200
                bg-white
                hover:-translate-y-0.5
                hover:border-[#a8b7f6]
                hover:shadow-[0_8px_22px_rgba(79,108,247,0.08)]
              `
        }
      `}
    >
      {/* AVATAR */}

      <div
        className={`
          relative
          h-[82px]
          w-[82px]
          overflow-hidden
          rounded-full
          border-[3px]
          transition-all
          duration-300

          ${
            selected
              ? `
                  border-[#4f6cf7]
                  shadow-[0_8px_25px_rgba(79,108,247,0.18)]
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
          fill
          sizes="82px"
          className="
            object-cover
            object-center
          "
        />
      </div>

      {/* LABEL */}

      <span
        className="
          text-[12px]
          font-bold
          text-[#071b59]
        "
      >
        {label}
      </span>

      {/* SELECTED CHECK */}

      {selected && (
        <span
          className="
            absolute
            right-3
            top-3
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#2468f2]
            text-white
            shadow-[0_6px_14px_rgba(36,104,242,0.25)]
          "
        >
          <Check
            size={13}
            strokeWidth={3}
          />
        </span>
      )}
    </button>
  );
}