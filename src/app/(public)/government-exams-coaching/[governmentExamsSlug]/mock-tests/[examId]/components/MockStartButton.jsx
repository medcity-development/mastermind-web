import Link from "next/link";

import {
  ArrowRight,
  Play,
} from "lucide-react";

export default function MockStartButton({
  examId,
  uid,
  cid,
  title = "",
}) {
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
            `/government-exams-coaching/kerala-psc/mock-tests/${examId}/start`,

          query: {
            uid:
              String(uid),

            cid:
              String(cid),

            title:
              title,
          },
        }}
        className="
          group
          inline-flex
          min-w-[180px]
          items-center
          justify-center
          gap-2.5
          rounded-[14px]
          bg-gradient-to-r
          from-[#0b216c]
          via-[#164fa5]
          to-[#017cc0]
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
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-white/15
          "
        >
          <Play
            size={12}
            fill="currentColor"
          />
        </span>

        Start Exam

        <ArrowRight
          size={15}
          className="
            transition-transform
            group-hover:translate-x-1
          "
        />
      </Link>
    </div>
  );
}