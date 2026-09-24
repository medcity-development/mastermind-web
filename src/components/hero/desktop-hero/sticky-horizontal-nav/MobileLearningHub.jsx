import {
    ChevronDown,
    ChevronRight,
  } from "lucide-react";
  
  export default function MobileLearningHub({
    item,
    isOpen,
    onToggle,
    onItemClick,
  }) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className="
            flex
            min-h-[54px]
            w-full
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            px-3
            text-left
            text-[14px]
            font-semibold
            text-[#1f3158]
            hover:bg-[#f4f9ff]
          "
        >
          <span
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-[10px]
              bg-[#dff1ff]
            "
          >
            {item.icon}
          </span>
  
          <span className="flex-1">
            {item.label}
          </span>
  
          <ChevronDown
            className={`
              h-4
              w-4
              transition-transform
  
              ${
                isOpen
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>
  
        {isOpen && (
          <div
            className="
              ml-5
              mt-1
              space-y-1
              border-l-2
              border-[#dcecff]
              pb-2
              pl-3
            "
          >
            {item.children.map(
              (child) => (
                <button
                  key={
                    child.title
                  }
                  type="button"
                  onClick={() =>
                    onItemClick(
                      child
                    )
                  }
                  className="
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    transition-colors
                    hover:bg-[#f2f8ff]
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#edf6ff]
                    "
                  >
                    {child.icon}
                  </span>
  
                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        text-[13px]
                        font-semibold
                        text-[#17386f]
                      "
                    >
                      {child.title}
                    </p>
  
                    <p
                      className="
                        truncate
                        text-[10px]
                        text-[#8495ae]
                      "
                    >
                      {child.subtitle}
                    </p>
                  </div>
  
                  <ChevronRight
                    className="
                      h-3.5
                      w-3.5
                      text-[#9aabc2]
                    "
                  />
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  }