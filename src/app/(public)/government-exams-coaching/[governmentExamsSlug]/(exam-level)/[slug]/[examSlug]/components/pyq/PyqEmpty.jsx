import {
    FileQuestion,
  } from "lucide-react";
  
  export default function PyqEmpty() {
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
          <FileQuestion
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
          No Previous Questions
        </p>
  
        <p
          className="
            mx-auto
            mt-1
            max-w-sm
            text-[11px]
            leading-5
            text-slate-500
          "
        >
          No previous question
          papers are currently
          available.
        </p>
      </div>
    );
  }