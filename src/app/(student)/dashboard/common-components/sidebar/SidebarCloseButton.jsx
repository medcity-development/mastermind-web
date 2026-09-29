import {
    X,
  } from "lucide-react";
  
  export default function SidebarCloseButton({
    open,
    onClose,
  }) {
    return (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className={`
          fixed
  
          left-[94px]
          top-4
  
          z-[60]
  
          flex
          h-10
          w-10
          items-center
          justify-center
  
          rounded-full
  
          border
          border-white/15
  
          bg-[#090b12]
  
          text-white
  
          shadow-[0_10px_30px_rgba(0,0,0,0.40)]
  
          backdrop-blur-xl
  
          transition-all
          duration-300
  
          hover:scale-105
          hover:bg-[#111827]
  
          xl:hidden
  
          ${
            open
              ? `
                  translate-x-0
                  opacity-100
                `
              : `
                  pointer-events-none
                  -translate-x-5
                  opacity-0
                `
          }
        `}
      >
        <X
          size={18}
          strokeWidth={2.2}
        />
      </button>
    );
  }