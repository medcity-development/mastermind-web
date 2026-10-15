// src/app/(public)/profile-setup/components/ProfileHeader.jsx

import {
  UserRound,
} from "lucide-react";

export default function ProfileHeader() {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-slate-100
        pb-4
        lg:gap-4
        lg:pb-5
      "
    >
      <div
        className="
          shrink-0
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-blue-50
          to-indigo-100
          text-[#2468f2]
          ring-1
          ring-blue-100
          lg:h-14
          lg:w-14
        "
      >
        <UserRound
          size={22}
        />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 lg:text-[10px]">
          Student account
        </p>
        <h2
          id="profile-setup-title"
          className="
            mt-0.5
            text-[21px]
            font-extrabold
            tracking-[-0.04em]
            text-[#071b59]
            lg:text-[27px]
          "
        >
          Complete Your Profile
        </h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500 lg:text-[13px]">
          Add your details to personalize your learning experience.
        </p>
      </div>
    </div>
  );
}