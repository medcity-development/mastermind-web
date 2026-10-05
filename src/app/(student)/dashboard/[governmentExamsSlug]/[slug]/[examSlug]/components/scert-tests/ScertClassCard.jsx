import {
    ArrowRight,
    BookOpenCheck,
  } from "lucide-react";
  
  export default function ScertClassCard({
    item,
    onClick,
  }) {
    if (!item?.id) {
      return null;
    }
  
    const title =
      item?.class ||
      item?.class_name ||
      item?.name ||
      `Class ${item.id}`;
  
    return (
      <button
        type="button"
        onClick={() =>
          onClick?.(item)
        }
        className="
          group
          flex
          min-h-[145px]
          w-full
          flex-col
          items-start
          justify-between
          rounded-[20px]
          border
          border-[#dce8f7]
          bg-gradient-to-br
          from-white
          to-[#f7fbff]
          p-5
          text-left
          shadow-[0_8px_24px_rgba(15,58,110,0.04)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-[#bcd8f1]
          hover:shadow-[0_16px_35px_rgba(15,58,110,0.10)]
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-[14px]
            bg-[#edf7ff]
            text-[#075fc8]
          "
        >
          <BookOpenCheck
            size={20}
          />
        </div>
  
        <div
          className="
            mt-5
            flex
            w-full
            items-end
            justify-between
            gap-3
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#017dc0]
              "
            >
              SCERT
            </p>
  
            <h3
              className="
                mt-1
                text-[16px]
                font-black
                text-[#071f55]
              "
            >
              {title}
            </h3>
          </div>
  
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#edf7ff]
              text-[#075fc8]
              transition-all
              duration-300
              group-hover:bg-[#075fc8]
              group-hover:text-white
            "
          >
            <ArrowRight
              size={16}
            />
          </span>
        </div>
      </button>
    );
  }