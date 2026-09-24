import {
    BellOff,
  } from "lucide-react";
  
  export default function NotificationsEmpty() {
    return (
      <div
        className="
          col-span-full
          rounded-[22px]
          border
          border-[#dce8f7]
          bg-white
          px-5
          py-14
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
            rounded-full
            bg-[#edf7ff]
            text-[#087bea]
          "
        >
          <BellOff size={20} />
        </div>
  
        <h3
          className="
            mt-4
            text-base
            font-black
            text-[#102c5c]
          "
        >
          No notifications found
        </h3>
  
        <p
          className="
            mt-1
            text-xs
            text-slate-500
          "
        >
          New Kerala PSC
          notifications will appear
          here.
        </p>
      </div>
    );
  }