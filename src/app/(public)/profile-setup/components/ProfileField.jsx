// src/app/(public)/profile-setup/components/ProfileField.jsx

export default function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        className="
          mb-1
          block
          text-[11px]
          font-semibold
          text-slate-700
          lg:text-[13px]
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        className="
          h-[42px]
          w-full
          rounded-[11px]
          border
          border-slate-200
          bg-slate-50/70
          px-3
          text-[12px]
          font-medium
          text-slate-800
          outline-none
          transition-all
          duration-200
          lg:h-[50px]
          lg:rounded-[12px]
          lg:px-4
          lg:text-[14px]

          placeholder:text-slate-400

          focus:border-[#4f6cf7]
          focus:bg-white
          focus:shadow-[0_0_0_4px_rgba(79,108,247,0.08)]
          hover:border-slate-300
        "
      />
    </div>
  );
}