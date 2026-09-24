import {
    ClipboardX,
  } from "lucide-react";
  
  export default function MockTestEmpty() {
    return (
      <div
        className="
          rounded-[22px]
          bg-slate-50
          px-5
          py-14
          text-center
        "
      >
        <ClipboardX
          size={32}
          className="
            mx-auto
            text-slate-300
          "
        />
  
        <p
          className="
            mt-3
            text-sm
            font-bold
            text-slate-500
          "
        >
          No mock tests
          available.
        </p>
      </div>
    );
  }