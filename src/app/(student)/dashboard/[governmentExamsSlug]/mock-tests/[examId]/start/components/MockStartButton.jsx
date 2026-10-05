import Link from "next/link";

import {
  ArrowRight,
  Play,
} from "lucide-react";

export default function MockStartButton({
  examId,
  governmentExamsSlug,
  examTitle = "",
}) {
  if (
    !examId ||
    !governmentExamsSlug
  ) {
    return null;
  }

  const startPath =
    `/dashboard/${governmentExamsSlug}/mock-tests/${examId}/start`;

  return (
    <div
      className="
        mt-6
        flex
        justify-end
      "
    >
      <Link
        href={{
          pathname:
            startPath,

          query:
            examTitle
              ? {
                title:
                  examTitle,
              }
              : {},
        }}
        className="
          group

          inline-flex
          min-w-[185px]
          items-center
          justify-center
          gap-2.5

          rounded-[14px]

          bg-gradient-to-r
          from-[#0b216c]
          via-[#164fa5]
          to-[#017dc0]

          px-7
          py-4

          text-[12px]
          font-extrabold
          text-white

          shadow-[0_12px_30px_rgba(22,79,165,0.22)]

          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:shadow-[0_18px_38px_rgba(22,79,165,0.30)]
        "
      >
        <span
          className="
            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-full

            border
            border-white/10

            bg-white/15

            transition-transform
            duration-300

            group-hover:scale-105
          "
        >
          <Play
            size={13}
            fill="currentColor"
          />
        </span>

        Start Exam

        <ArrowRight
          size={15}
          className="
            transition-transform
            duration-300

            group-hover:translate-x-1
          "
        />
      </Link>
    </div>
  );
}