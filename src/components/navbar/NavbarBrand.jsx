import Image from "next/image";
import Link from "next/link";

export default function NavbarBrand() {
  return (
    <Link
      href="/"
      aria-label="MasterMind Academy Home"
      className="
        flex
        h-full
        shrink-0
        items-center
      "
    >
      <Image
        src="/assets/logo-128.png"
        alt="MasterMind Academy"
        width={180}
        height={90}
        priority
        className="w-[160px] h-[70px] md:w-[180px] h-[90px] object-contain"
      />
    </Link>
  );
}