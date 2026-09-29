// src/app/(student)/dashboard/[governmentExamsSlug]/current-affairs/[slug]/components/CurrentAffairsContent.jsx

import {
    AlertCircle,
    Newspaper,
} from "lucide-react";

export default function CurrentAffairsContent({
    title,
    selectedDate,
    content = [],
    filePath = "",
    loading,
    error,
}) {
    if (loading) {
        return (
            <LoadingState />
        );
    }

    if (error) {
        return (
            <div
                className="
          mt-5

          rounded-[22px]

          border
          border-red-100

          bg-red-50

          px-5
          py-10

          text-center
        "
            >
                <AlertCircle
                    size={26}
                    className="
            mx-auto
            text-red-400
          "
                />

                <p
                    className="
            mt-3

            text-sm
            font-semibold
            text-red-600
          "
                >
                    {error}
                </p>
            </div>
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
                <Newspaper
                    size={28}
                    className="
            mx-auto
            text-slate-300
          "
                />

                <p
                    className="
            mt-3

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
                        {selectedDate}
                        {" "}
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
                        const basePath =
                            String(
                                filePath ||
                                ""
                            ).replace(
                                /\/$/,
                                ""
                            );

                        const imageUrl =
                            item?.image &&
                                basePath
                                ? `${basePath}/${item.image}`
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

                        [&_a]:text-[#087bea]
                        [&_a]:underline

                        [&_b]:font-bold
                        [&_b]:text-[#123d7a]

                        [&_p]:mb-2

                        [&_ul]:ml-5
                        [&_ul]:list-disc
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
                                                loading="lazy"
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
              h-[110px]

              animate-pulse

              rounded-[18px]

              border
              border-slate-100

              bg-white
            "
                    />
                )
            )}
        </div>
    );
}