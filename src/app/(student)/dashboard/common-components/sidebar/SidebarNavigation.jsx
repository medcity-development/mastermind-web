import SidebarItem from "./SidebarItem";

export default function SidebarNavigation({
  mainItems,
  accountItems,
  isActive,
  onNavigate,
}) {
  return (
    <div
      className="
        relative
        z-10

        mt-4

        flex-1
        overflow-y-auto

        px-2
        pb-5

        [scrollbar-width:none]

        xl:mt-5
        xl:px-3

        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* Learning */}

      <SidebarGroup
        title="Learning"
        items={mainItems}
        isActive={isActive}
        onNavigate={onNavigate}
      />

      {/* Account */}

      <div className="mt-5 xl:mt-7">
        <SidebarGroup
          title="My Account"
          items={accountItems}
          isActive={isActive}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

function SidebarGroup({
  title,
  items,
  isActive,
  onNavigate,
}) {
  return (
    <>
      <div
        className="
          mb-2
          hidden
          items-center
          gap-2
          px-3

          xl:flex
        "
      >
        {/* Glow dot */}

        <span
          className="
            h-[5px]
            w-[5px]
            shrink-0

            rounded-full

            bg-[#22d3ee]

            shadow-[0_0_10px_rgba(34,211,238,0.85)]
          "
        />

        {/* Section title */}

        <p
          className="
            bg-gradient-to-r
            from-[#67e8f9]
            via-[#60a5fa]
            to-[#c084fc]

            bg-clip-text

            text-[8px]
            font-black
            uppercase
            tracking-[0.22em]

            text-transparent

            drop-shadow-[0_0_8px_rgba(96,165,250,0.15)]
          "
        >
          {title}
        </p>

        {/* Line */}

        <span
          className="
            ml-1
            h-px
            flex-1

            bg-gradient-to-r
            from-[#60a5fa]/30
            via-[#8b5cf6]/15
            to-transparent
          "
        />
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            active={isActive(
              item.href
            )}
            onNavigate={
              onNavigate
            }
          />
        ))}
      </nav>
    </>
  );
}