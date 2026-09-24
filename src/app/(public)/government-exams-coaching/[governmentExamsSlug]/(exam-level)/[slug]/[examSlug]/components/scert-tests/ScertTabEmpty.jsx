import {
    BookOpenCheck,
  } from "lucide-react";
  
  export default function ScertTabEmpty({
    title = "No SCERT Content",
    message =
      "No SCERT classes or tests are currently available.",
  }) {
    return (
      <div
        className="
          mt-6
          rounded-[18px]
          border
          border-dashed
          border-[#d7e4f2]
          bg-[#fbfdff]
          px-5
          py-12
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-[14px]
            bg-[#edf7ff]
            text-[#075fc8]
          "
        >
          <BookOpenCheck
            size={21}
          />
        </div>
  
        <p
          className="
            mt-4
            text-[13px]
            font-black
            text-[#102c5c]
          "
        >
          {title}
        </p>
  
        <p
          className="
            mx-auto
            mt-1
            max-w-md
            text-[11px]
            leading-5
            text-slate-500
          "
        >
          {message}
        </p>
      </div>
    );
  }