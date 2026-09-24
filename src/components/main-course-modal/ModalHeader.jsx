import { BookOpen } from "lucide-react";

export default function ModalHeader() {
  return (
    <div className="max-w-[520px] pr-10">
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-[#eaf6ff]
          px-3
          py-1.5
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-[#017cc0]
        "
      >
        <BookOpen size={13} />

        Choose Your Path
      </div>

      <h2
        id="main-courses-title"
        className="
          mt-4
          text-[27px]
          font-black
          leading-[1.08]
          tracking-[-0.03em]
          text-[#081f5c]
          sm:text-[34px]
        "
      >
        What do you want to{" "}
        <span
          className="
            bg-gradient-to-r
            from-[#164fa5]
            via-[#017cc0]
            to-[#00b5e8]
            bg-clip-text
            text-transparent
          "
        >
          prepare for?
        </span>
      </h2>

      <p
        className="
          mt-3
          max-w-[500px]
          text-[13px]
          leading-5
          text-slate-500
          sm:text-[14px]
        "
      >
        Select your exam category to explore courses,
        study materials and practice tests.
      </p>
    </div>
  );
}