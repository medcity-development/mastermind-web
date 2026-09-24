import {
    FileQuestion,
  } from "lucide-react";
  
  export default function PyqHeader({
    count = 0,
  }) {
    return (
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#edf7ff]
              text-[#075fc8]
            "
          >
            <FileQuestion
              size={20}
            />
          </div>
  
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#075fc8]
              "
            >
              Practice
            </p>
  
            <h2
              className="
                mt-1
                text-lg
                font-black
                text-[#102c5c]
              "
            >
              Previous Questions
            </h2>
  
            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Practice Kerala PSC
              previous year question
              papers.
            </p>
          </div>
        </div>
  
        {count > 0 && (
          <span
            className="
              w-fit
              rounded-full
              bg-[#edf7ff]
              px-3
              py-2
              text-[10px]
              font-bold
              text-[#075fc8]
            "
          >
            {count} Available
          </span>
        )}
      </div>
    );
  }