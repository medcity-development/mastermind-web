import Image from "next/image";

import LoginCard from "./LoginCard";

export default function LoginPage() {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#05070d]
      "
    >
      <Image
        src="/assets/government-exams.webp"
        alt="Government exams"
        fill
        priority
        sizes="100vw"
        className="
          object-cover
          object-center
          opacity-80
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-black/25
        "
      />

      <div
        className="
          relative
          z-20
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            w-full
            max-w-[460px]
          "
        >
          <LoginCard />
        </div>
      </div>
    </main>
  );
}