import { Mail, Phone } from "lucide-react";

const topbarItems = [
  {
    type: "text",
    label: "The Best Online Learning Platform in India",
  },
  {
    type: "phone",
    label: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    type: "email",
    label: "info@mastermind.in",
    href: "mailto:info@mastermind.in",
  },
];

function TopbarItem({ item }) {
  if (item.type === "phone") {
    return (
      <a href={item.href} aria-label={`Call MasterMind Academy at ${item.label}`} className="flex shrink-0 items-center gap-2 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70">
          <Phone aria-hidden="true" className="h-4 w-4" />
        </span>
        <span>{item.label}</span>
      </a>
    );
  }

  if (item.type === "email") {
    return (
      <a href={item.href} aria-label={`Email MasterMind Academy at ${item.label}`} className="flex shrink-0 items-center gap-2 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70">
          <Mail aria-hidden="true" className="h-4 w-4" />
        </span>
        <span>{item.label}</span>
      </a>
    );
  }

  return <p className="shrink-0">{item.label}</p>;
}

function TopbarContent({ ariaHidden = false }) {
    return (
      <div
        aria-hidden={ariaHidden}
        className="flex shrink-0 items-center gap-16 pr-16 text-4xl"
      >
        {topbarItems.map((item) => (
          <TopbarItem key={`${item.type}-${item.label}`} item={item} />
        ))}
      </div>
    );
  }

  export default function Topbar() {
    return (
      <aside aria-label="MasterMind Academy contact information" className="relative left-1/2 hidden w-screen -translate-x-1/2 overflow-hidden bg-[#05176a] py-2 text-white md:block">
        <div className="topbar-marquee items-center whitespace-nowrap text-sm font-medium lg:text-base">
          <TopbarContent />
        </div>
      </aside>
    );
  }