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
        pb-3
        lg:gap-4
        sm:pb-4
        lg:pb-5
      "
    >
      <div
        className="
          shrink-0
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-blue-50
          to-indigo-100
          text-[#2468f2]
          ring-1
          ring-blue-100
          sm:h-12
          sm:w-12
          lg:h-14
          lg:w-14
        "
      >
        <UserRound
          size={22}
        />
      </div>

      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-[9px] sm:tracking-[0.2em] lg:text-[10px]">
          Student account
        </p>
        <h2
          id="profile-setup-title"
          className="
            mt-0.5
            text-[18px]
            font-extrabold
            tracking-[-0.04em]
            text-[#071b59]
            sm:text-[22px]
            lg:text-[27px]
          "
        >
          Complete Your Profile
        </h2>
        <p className="mt-1 text-[10px] leading-[1.4] text-slate-500 sm:text-[11px] sm:leading-4 lg:text-[13px]">
          Add your details to personalize your learning experience.
        </p>
      </div>
    </div>
  );
}