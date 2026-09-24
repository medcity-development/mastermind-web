import Image from "next/image";

export default function AboutHeroVisual() {
  return (
    <div
      className="
        relative
        h-[340px]
        w-full
        overflow-hidden
        rounded-[22px]
        border
        border-white/90
        bg-[#eef8ff]
        shadow-[0_16px_40px_rgba(8,31,92,0.1)]
        sm:h-[380px]
        lg:h-[420px]
      "
    >
      <Image
        src="/assets/psc-candidate-preparing-exam.png"
        alt="Student preparing for Kerala PSC, SSC and RRB competitive exams"
        fill
        priority
        quality={100}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
        className="
          object-cover
          object-center
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-gradient-to-t
          from-[#081f5c]/8
          via-transparent
          to-transparent
        "
      />

      <div
        className="
          absolute
          left-3
          top-3
          z-10
          flex
          gap-1.5
        "
      >
        {["KERALA PSC", "SSC", "RRB"].map((item) => (
          <span
            key={item}
            className="
              rounded-full
              border
              border-white/40
              bg-black/80
              px-2.5
              py-1
              text-[7px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-white
              shadow-sm
              backdrop-blur-md
            "
          >
            {item}
          </span>
        ))}
      </div>

      
    </div>
  );
}