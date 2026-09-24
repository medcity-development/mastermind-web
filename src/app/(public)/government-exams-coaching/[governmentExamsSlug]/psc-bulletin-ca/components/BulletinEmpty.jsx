import {
    BookOpenText,
  } from "lucide-react";
  
  export default function BulletinEmpty() {
    return (
      <div
        className="
          rounded-[20px]
          bg-slate-50
          px-5
          py-12
          text-center
        "
      >
        <BookOpenText
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
          No bulletin months
          available.
        </p>
      </div>
    );
  }