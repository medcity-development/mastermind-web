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
          mb-2
          block
          text-[12px]
          font-bold
          text-[#071b59]
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
          h-[52px]
          w-full
          rounded-[12px]
          border
          border-slate-200
          bg-white
          px-4
          text-[13px]
          font-medium
          text-slate-800
          outline-none
          transition-all
          duration-200

          placeholder:text-slate-400

          focus:border-[#4f6cf7]
          focus:shadow-[0_0_0_4px_rgba(79,108,247,0.08)]
        "
      />
    </div>
  );
}