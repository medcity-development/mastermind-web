// src/app/(public)/profile-setup/components/TermsCheckbox.jsx

import Link from "next/link";

export default function TermsCheckbox({
  checked,
  onChange,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-slate-100
        bg-[#f8faff]
        p-3
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="
          mt-0.5
          h-4
          w-4
          shrink-0
          accent-[#2468f2]
        "
      />

      <span
        className="
          text-[11px]
          leading-5
          text-slate-600
        "
      >
        I have read and accept the{" "}

        <Link
          href="/terms"
          target="_blank"
          className="
            font-bold
            text-[#3854e8]
            transition
            hover:text-[#7139f4]
          "
        >
          Terms and Conditions
        </Link>
        .
      </span>
    </label>
  );
}