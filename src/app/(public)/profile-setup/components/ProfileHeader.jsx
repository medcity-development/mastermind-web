// src/app/(public)/profile-setup/components/ProfileHeader.jsx

import {
  UserRound,
} from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="text-center">
      <div
        className="
          mx-auto
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          bg-[#eef4ff]
          text-[#2468f2]
        "
      >
        <UserRound
          size={21}
        />
      </div>

      <h2
        className="
          mt-3
          text-[28px]
          font-extrabold
          tracking-[-0.04em]
          text-[#071b59]
        "
      >
        Complete Your Profile
      </h2>

      <p
        className="
          mx-auto
          mt-1
          max-w-[330px]
          text-[12px]
          leading-5
          text-slate-500
        "
      >
        Tell us a little about
        yourself before you continue.
      </p>
    </div>
  );
}