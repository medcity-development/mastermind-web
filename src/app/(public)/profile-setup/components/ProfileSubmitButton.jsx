// src/app/(public)/profile-setup/components/ProfileSubmitButton.jsx

import {
  Check,
  LoaderCircle,
} from "lucide-react";

export default function ProfileSubmitButton({
  loading = false,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        group
        flex
        h-[54px]
        w-full
        items-center
        justify-center
        gap-2
        rounded-[14px]
        bg-gradient-to-r
        from-[#0969f1]
        via-[#315ff4]
        to-[#7b35f2]
        text-[13px]
        font-bold
        text-white
        shadow-[0_14px_30px_rgba(67,74,239,0.24)]
        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:shadow-[0_18px_36px_rgba(67,74,239,0.32)]

        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <LoaderCircle
            size={17}
            className="animate-spin"
          />

          Saving...
        </>
      ) : (
        <>
          Continue

          <Check
            size={17}
            className="
              transition-transform
              group-hover:translate-x-0.5
            "
          />
        </>
      )}
    </button>
  );
}