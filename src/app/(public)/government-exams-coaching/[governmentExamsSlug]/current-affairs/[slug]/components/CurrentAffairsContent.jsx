import {
    Newspaper,
  } from "lucide-react";
  
  export default function CurrentAffairsContent({
    title,
    selectedDate,
    content = [],
    filePath = "",
    loading,
  }) {
    if (loading) {
      return (
        <LoadingState />
      );
    }
  
    if (!content.length) {
      return (
        <div
          className="
            mt-5
            rounded-[22px]
            border
            border-slate-200
            bg-white
            px-5
            py-12
            text-center
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-slate-600
            "
          >
            No current affairs
            available for this date.
          </p>
        </div>
      );
    }
  
    return (
      <section
        className="
          mt-5
          rounded-[24px]
          border
          border-[#dfeaf7]
          bg-white
          p-4
          shadow-[0_12px_35px_rgba(22,79,165,0.06)]
          sm:p-6
        "
      >
        {/* HEADER */}
  
        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-slate-100
            pb-4
          "
        >
          <span
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-[#087bea]
              to-[#7c3aed]
              text-white
            "
          >
            <Newspaper
              size={20}
            />
          </span>
  
          <div>
            <h2
              className="
                text-base
                font-bold
                text-[#102c5c]
              "
            >
              {selectedDate}{" "}
              {title}
            </h2>
  
            <p
              className="
                mt-0.5
                text-[10px]
                text-slate-500
              "
            >
              Daily Current Affairs
            </p>
          </div>
        </div>
  
        {/* ITEMS */}
  
        <div
          className="
            mt-5
            space-y-4
          "
        >
          {content.map(
            (
              item,
              index
            ) => {
              const imageUrl =
                item?.image &&
                filePath
                  ? `${filePath.replace(
                      /\/$/,
                      ""
                    )}/${item.image}`
                  : "";
  
              return (
                <article
                  key={
                    item?.id ??
                    index
                  }
                  className="
                    overflow-hidden
                    rounded-[18px]
                    border
                    border-[#e4edf7]
                    bg-gradient-to-br
                    from-white
                    to-[#fbfdff]
                    p-4
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      gap-3
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#edf7ff]
                        text-[10px]
                        font-bold
                        text-[#087bea]
                      "
                    >
                      {index + 1}
                    </span>
  
                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          text-[13px]
                          leading-7
                          text-[#243b61]
                          [&_b]:font-bold
                          [&_b]:text-[#123d7a]
                        "
                        dangerouslySetInnerHTML={{
                          __html:
                            item?.data ??
                            "",
                        }}
                      />
  
                      {imageUrl && (
                        <img
                          src={
                            imageUrl
                          }
                          alt=""
                          className="
                            mt-4
                            max-h-[380px]
                            w-auto
                            max-w-full
                            rounded-[14px]
                            object-contain
                          "
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>
    );
  }
  
  function LoadingState() {
    return (
      <div
        className="
          mt-5
          space-y-3
        "
      >
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                h-[100px]
                animate-pulse
                rounded-[18px]
                bg-white
              "
            />
          )
        )}
      </div>
    );
  }