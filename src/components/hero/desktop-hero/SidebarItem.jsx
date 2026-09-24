// src/components/hero/desktop-hero/SidebarItem.jsx

export default function SidebarItem({
  icon,
  title,
  subtitle,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        grid
        min-h-[88px]
        w-full
        grid-cols-[46px_1fr_auto]
        items-center
        gap-3
        rounded-2xl
        border
        border-white
        bg-white/90
        p-4
        text-left
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md cursor-pointer
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-xl
          text-blue-600
        "
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#07133d]">
          {title}
        </h3>

        <p className="mt-1 text-[11px] text-slate-500">
          {subtitle}
        </p>
      </div>

      <span
        className="
          text-2xl
          text-blue-700
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
      >
        ›
      </span>
    </button>
  );
}