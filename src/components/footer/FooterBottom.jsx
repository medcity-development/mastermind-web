// src/components/footer/FooterBottom.jsx

import Link from "next/link";

import {
  legalLinks,
} from "./footerData";

export default function FooterBottom() {
  const year =
    new Date()
      .getFullYear();

  return (
    <div
      className="
        mt-10
        border-t
        border-[#00b5e8]/15
        py-5
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          justify-between
          gap-3
          text-center
          md:flex-row
          md:text-left
        "
      >
        <p
          className="
            text-[10px]
            text-white/40
          "
        >
          © {year} MasterMind Academy.
          All rights reserved.
        </p>

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-5
            gap-y-2
          "
        >
          {legalLinks.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  text-[10px]
                  text-white/40
                  transition-colors
                  hover:text-[#00b5e8]
                "
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}