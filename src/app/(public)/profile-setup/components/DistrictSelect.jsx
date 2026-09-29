// src/app/(public)/profile-setup/components/DistrictSelect.jsx

import {
  ChevronDown,
} from "lucide-react";

import {
  DISTRICTS,
} from "./profileData";

export default function DistrictSelect({
  value,
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
        District

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-[52px]
            w-full
            appearance-none
            rounded-[12px]
            border
            border-slate-200
            bg-white
            px-4
            pr-10
            text-[13px]
            font-medium
            text-slate-700
            outline-none
            transition-all
            duration-200

            focus:border-[#4f6cf7]
            focus:shadow-[0_0_0_4px_rgba(79,108,247,0.08)]
          "
        >
          <option value="">
            Select district
          </option>

          {DISTRICTS.map(
            (district) => (
              <option
                key={district}
                value={district}
              >
                {district}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={16}
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>
    </div>
  );
}