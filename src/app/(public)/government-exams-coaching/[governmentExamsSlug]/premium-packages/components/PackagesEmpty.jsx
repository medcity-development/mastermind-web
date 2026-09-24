import {
    PackageOpen,
  } from "lucide-react";
  
  export default function PackagesEmpty() {
    return (
      <div
        className="
          mt-6
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          px-6
          py-14
          text-center
        "
      >
        <PackageOpen
          size={36}
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
          No premium plans
          available right now.
        </p>
      </div>
    );
  }