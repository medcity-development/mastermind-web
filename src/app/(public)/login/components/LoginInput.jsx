"use client";

export default function LoginInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
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
      </label>

      <div
        className="
          group
          flex
          h-[54px]
          items-center
          rounded-[12px]
          border
          border-slate-200
          bg-white
          px-4
          transition-all
          duration-200
          focus-within:border-[#4f6cf7]
          focus-within:shadow-[0_0_0_4px_rgba(79,108,247,0.08)]
        "
      >
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className="
              shrink-0
              text-[#354f9c]
            "
          />
        )}

        <input
          type={type}
          value={value}
          onChange={
            onChange
          }
          placeholder={
            placeholder
          }
          autoComplete="username"
          className="
            h-full
            min-w-0
            flex-1
            bg-transparent
            px-3
            text-[13px]
            font-medium
            text-slate-800
            outline-none
            placeholder:text-slate-400
          "
        />
      </div>
    </div>
  );
}