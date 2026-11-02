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
          mb-1.5
          block
          text-[10px]
          font-semibold
          text-slate-700
          sm:text-[11px]
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
          rounded-[12px]
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
          shadow-[0_1px_2px_rgba(15,23,42,0.02)]
          lg:h-[50px]
          lg:rounded-[12px]
          lg:px-4
          lg:text-[14px]

          placeholder:text-slate-400

          focus:border-[#4f6cf7]
          focus:bg-white
          focus:shadow-[0_0_0_3px_rgba(79,108,247,0.1)]
          hover:border-slate-300
        "
      />
    </div>
  );
}