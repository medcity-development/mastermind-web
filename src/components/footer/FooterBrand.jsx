// src/components/footer/FooterBrand.jsx

import Image from "next/image";
import Link from "next/link";

import SocialLinks from "./SocialLinks";

export default function FooterBrand() {
  return (
    <div>
      <Link
        href="/"
        className="
          inline-flex
          items-center
          gap-3
        "
      >
        <div
          className="
            relative
            h-[58px]
            w-[76px]
          "
        >
          <Image
            src="/assets/logo-128.png"
            alt="MasterMind Academy"
            fill
            sizes="76px"
            className="
              object-contain
              object-left
            "
          />
        </div>
      </Link>

      <p
        className="
          mt-4
          max-w-[290px]
          text-[12px]
          leading-[1.75]
          text-white/60
        "
      >
        Smart preparation for Kerala PSC,
        RRB and SSC examinations with expert
        guidance, practice tests and quality
        learning resources.
      </p>

      <SocialLinks />
    </div>
  );
}