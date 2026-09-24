"use client";

import {
  useState,
} from "react";

import {
  ArrowRight,
} from "lucide-react";
import MainCoursesModal from "@/components/main-course-modal/MainCoursesModal";



export default function StudyMaterialsLauncher() {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="
          group
          flex
          w-full
          items-center
          justify-between
          rounded-[18px]
          bg-gradient-to-r
          from-[#2563eb]
          via-[#4f46e5]
          to-[#7c3aed]
          px-5
          py-6 mt-4
          text-left
          text-white
          shadow-[0_10px_25px_rgba(79,70,229,0.18)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-[0_15px_32px_rgba(79,70,229,0.25)]
        "
      >
        <div>
          <p
            className="
              text-[13px]
              font-black
            "
          >
            Download Study Materials
          </p>

          <p
            className="
              mt-1
              text-[11px]
              text-white/75
            "
          >
            Access helpful study resources
          </p>
        </div>

        <span
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/15
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        >
          <ArrowRight
            size={16}
          />
        </span>
      </button>

      <MainCoursesModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        destinationPath="study-materials"
      />
    </>
  );
}