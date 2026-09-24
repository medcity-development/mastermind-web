import Image from "next/image";

const students = [
  {
    src: "/assets/psc-candidate1.png",
    alt: "MasterMind student",
  },
  {
    src: "/assets/psc-candidate2.png",
    alt: "MasterMind student",
  },
  {
    src: "/assets/psc-candidate3.png",
    alt: "MasterMind student",
  },
];

export default function MobileHeroTrust() {
  return (
    <div
      className="
        mx-auto
        mt-7
        flex
        max-w-[570px]
        items-center
        justify-center
        gap-3
        border-t
        border-white/10
        pt-5
      "
    >
      <div className="flex shrink-0 -space-x-2">
        {students.map((student) => (
          <div
            key={student.src}
            className="
              relative
              h-9
              w-9
              overflow-hidden
              rounded-full
              border-2
              border-[#0b1f68]
              bg-blue-950
              shadow-sm
            "
          >
            <Image
              src={student.src}
              alt={student.alt}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <p
        className="
          text-left
          text-xs
          leading-5
          text-blue-100/70
          sm:text-sm
        "
      >
        Trusted by{" "}
        <strong className="font-bold text-white">
          5,000+ aspirants
        </strong>{" "}
        preparing for competitive exams
      </p>
    </div>
  );
}