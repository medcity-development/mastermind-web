import {
    PlayCircle,
  } from "lucide-react";
  
  export default function TopicVideoEmpty() {
    return (
      <div
        className="
          mt-6
          rounded-[22px]
          border
          border-dashed
          border-[#cbdbea]
          bg-white
          px-6
          py-14
          text-center
        "
      >
        <span
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-[#edf7ff]
            text-[#087bea]
          "
        >
          <PlayCircle
            size={26}
          />
        </span>
  
        <h3
          className="
            mt-4
            text-sm
            font-black
            text-[#071f55]
          "
        >
          No videos available
        </h3>
  
        <p
          className="
            mt-1
            text-[11px]
            text-slate-500
          "
        >
          Video lessons will appear here when available.
        </p>
      </div>
    );
  }