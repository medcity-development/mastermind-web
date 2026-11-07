import listingStyles from "@/app/(student)/dashboard/common-components/TestListingCard.module.css";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function ScertFolderCard({
  folder,
  governmentExamsSlug = "kerala-psc",
  examName = "Kerala PSC",
}) {
  if (!folder?.id) {
    return null;
  }

  return (
    <Link
      href={`/government-exams-coaching/${governmentExamsSlug}/scert-tests/classes/${folder.id}`}
      className={listingStyles.card}
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-[#071f55]
          via-[#075fc8]
          to-[#017dc0]
          text-white
        "
      >
        <GraduationCap
          size={25}
        />
      </div>

      <p
        className="
          mt-5
          text-[10px]
          font-black
          uppercase
          tracking-[0.16em]
          text-[#017dc0]
        "
      >
        {examName} SCERT
      </p>

      <h3
        className="
          mt-2
          text-xl
          font-black
          text-[#071f55]
        "
      >
        {folder.class}
      </h3>

      <div
        className="
          mt-3
          flex
          items-center
          gap-2
          text-xs
          text-slate-500
        "
      >
        <BookOpen
          size={15}
        />

        Practice Tests
      </div>

      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          pt-6
          text-sm
          font-bold
          text-[#075fc8]
        "
      >
        View Tests

        <ArrowRight
          size={17}
          className="
            transition-transform
            group-hover:translate-x-1
          "
        />
      </div>
    </Link>
  );
}