import {
    CheckCircle2,
    ClipboardList,
  } from "lucide-react";
  
  export default function MockTestInstructions({
    instructions = [],
  }) {
    if (
      !Array.isArray(instructions) ||
      instructions.length === 0
    ) {
      return null;
    }
  
    return (
      <section
        className="
          mt-4
          rounded-[18px]
          border
          border-[#dce8f7]
          bg-white
          p-4
          shadow-[0_8px_24px_rgba(49,84,238,0.04)]
        "
      >
        {/* HEADER */}
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[11px]
              bg-[#eef3ff]
              text-[#3154ee]
            "
          >
            <ClipboardList size={16} />
          </div>
  
          <div>
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-[#7a2d73]
              "
            >
              Before you start
            </p>
  
            <h2
              className="
                text-[15px]
                font-black
                leading-5
                text-[#172554]
              "
            >
              Test Instructions
            </h2>
          </div>
        </div>
  
        {/* INSTRUCTIONS */}
        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-2
            lg:grid-cols-2
          "
        >
          {instructions.map((item, index) => (
            <div
              key={index}
              className="
                flex
                items-start
                gap-2
                rounded-[11px]
                bg-[#f8faff]
                px-3
                py-2.5
              "
            >
              <CheckCircle2
                size={14}
                className="
                  mt-[2px]
                  shrink-0
                  text-[#3154ee]
                "
              />
  
              <p
                className="
                  text-[11px]
                  font-medium
                  leading-[18px]
                  text-slate-600
                "
              >
                {item?.instructions}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }