"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  LoaderCircle,
  PlayCircle,
} from "lucide-react";

import TopicChapterList from "./TopicChapterList";

/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(
  item = {}
) {
  return {
    ...item,

    id:
      item?.id ??
      item?.subjectid ??
      item?.subject_id ??
      null,

    title:
      item?.subject ||
      item?.name ||
      item?.title ||
      "Video Category",

    titleMal:
      item?.subject_mal ||
      item?.name_mal ||
      item?.title_mal ||
      "",

    topicCount:
      Number(
        item?.chapter_count ??
          item?.count ??
          0
      ) || 0,
  };
}

/* =========================================================
   NORMALIZE TOPIC
========================================================= */

function normalizeTopic(
  item = {}
) {
  return {
    ...item,

    id:
      item?.id ??
      item?.topicid ??
      item?.topic_id ??
      null,

    name:
      item?.name ||
      item?.topic ||
      item?.title ||
      "Topic",

    name_mal:
      item?.name_mal ||
      item?.topic_mal ||
      item?.title_mal ||
      "",

    chapterCount:
      Number(
        item?.count ??
          item?.chapter_count ??
          0
      ) || 0,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TopicWiseTab({
  cid = 1,
  uid = 0,
  examId,
}) {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [
    topics,
    setTopics,
  ] = useState([]);

  const [
    selectedTopic,
    setSelectedTopic,
  ] = useState(null);

  const [
    chapters,
    setChapters,
  ] = useState([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    loadingTopics,
    setLoadingTopics,
  ] = useState(false);

  const [
    loadingChapters,
    setLoadingChapters,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     1. LOAD VIDEO CATEGORIES

     Example:
     {
       id: 45,
       subject: "SCERT Classes",
       chapter_count: 9
     }
  ========================================================= */

  useEffect(() => {
    if (!examId) {
      return;
    }

    const controller =
      new AbortController();

    async function loadCategories() {
      try {
        setLoadingCategories(
          true
        );

        setError("");

        setCategories([]);

        setSelectedCategory(
          null
        );

        setTopics([]);

        setSelectedTopic(
          null
        );

        setChapters([]);

        const params =
          new URLSearchParams({
            uid: String(uid),
            cid: String(cid),
            examId:
              String(examId),
          });

        const response =
          await fetch(
            `/api/sub-exam-video-source?${params.toString()}`,
            {
              cache:
                "no-store",
              signal:
                controller.signal,
            }
          );

        const result =
          await response.json();

        console.log(
          "VIDEO SOURCE RESPONSE:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to load video categories."
          );
        }

        const rawItems =
          Array.isArray(
            result?.items
          )
            ? result.items
            : Array.isArray(
                  result?.data
                )
              ? result.data
              : [];

        const normalized =
          rawItems
            .map(
              normalizeCategory
            )
            .filter(
              (item) =>
                item?.id
            );

        console.log(
          "VIDEO CATEGORIES:",
          normalized
        );

        setCategories(
          normalized
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "loadCategories:",
          error
        );

        setCategories([]);

        setError(
          error?.message ||
            "Unable to load video categories."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoadingCategories(
            false
          );
        }
      }
    }

    loadCategories();

    return () => {
      controller.abort();
    };
  }, [
    uid,
    cid,
    examId,
  ]);

  /* =========================================================
     2. CATEGORY CLICK

     IMPORTANT:

     category.id = subid

     Example:
     SCERT Classes
     category.id = 45

     Request:
     getTopicListNew

     subid = 45
     subexamid = examId
  ========================================================= */

  async function handleCategoryClick(
    category
  ) {
    if (
      !category?.id ||
      !examId
    ) {
      return;
    }

    try {
      setSelectedCategory(
        category
      );

      setSelectedTopic(
        null
      );

      setTopics([]);

      setChapters([]);

      setLoadingTopics(
        true
      );

      setError("");

      const params =
        new URLSearchParams({
          uid: String(uid),
          cid: String(cid),

          subId:
            String(
              category.id
            ),

          subExamId:
            String(
              examId
            ),
        });

      console.log(
        "TOPIC REQUEST:",
        {
          uid,
          cid,
          subId:
            category.id,
          subExamId:
            examId,
        }
      );

      const response =
        await fetch(
          `/api/sub-exam-topics?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      console.log(
        "TOPIC RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load topics."
        );
      }

      const topicList =
        Array.isArray(
          result?.data
        )
          ? result.data
              .map(
                normalizeTopic
              )
              .filter(
                (item) =>
                  item?.id
              )
          : [];

      console.log(
        "TOPICS:",
        topicList
      );

      setTopics(
        topicList
      );
    } catch (error) {
      console.error(
        "loadTopics:",
        error
      );

      setTopics([]);

      setError(
        error?.message ||
          "Unable to load topics."
      );
    } finally {
      setLoadingTopics(
        false
      );
    }
  }

  /* =========================================================
     3. TOPIC CLICK

     THIS is where getChaptersList must be called.

     Example:
       topic.id = 67

     Correct:
       topicId=67

     NOT:
       topicId=45
  ========================================================= */

  async function handleTopicClick(
    topic
  ) {
    if (!topic?.id) {
      return;
    }

    try {
      setSelectedTopic(
        topic
      );

      setChapters([]);

      setLoadingChapters(
        true
      );

      setError("");

      const params =
        new URLSearchParams({
          uid: String(uid),
          cid: String(cid),

          topicId:
            String(topic.id),

          offset: "0",
        });

      console.log(
        "CHAPTER REQUEST:",
        {
          uid,
          cid,
          topicId:
            topic.id,
        }
      );

      const response =
        await fetch(
          `/api/sub-exam-topic-chapters?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      console.log(
        "CHAPTER RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load chapters."
        );
      }

      const chapterList =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      setChapters(
        chapterList
      );
    } catch (error) {
      console.error(
        "loadChapters:",
        error
      );

      setChapters([]);

      setError(
        error?.message ||
          "Unable to load chapters."
      );
    } finally {
      setLoadingChapters(
        false
      );
    }
  }

  /* =========================================================
     4. CHAPTER / VIDEO VIEW
  ========================================================= */

  if (
    selectedCategory &&
    selectedTopic
  ) {
    return (
      <TopicChapterList
        topic={selectedTopic}
        chapters={
          chapters
        }
        loading={
          loadingChapters
        }
        error={error}
        onBack={() => {
          setSelectedTopic(
            null
          );

          setChapters([]);

          setError("");
        }}
      />
    );
  }

  /* =========================================================
     5. TOPICS VIEW
  ========================================================= */

  if (selectedCategory) {
    return (
      <section
        className="
          rounded-[24px]
          border
          border-[#dce8f7]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(22,79,165,0.05)]
          sm:p-6
        "
      >
        {/* BACK */}

        <button
          type="button"
          onClick={() => {
            setSelectedCategory(
              null
            );

            setTopics([]);

            setError("");
          }}
          className="
            inline-flex
            items-center
            gap-2
            text-[11px]
            font-bold
            text-[#075fc8]
            transition
            hover:text-[#164fa5]
          "
        >
          <ArrowLeft
            size={15}
          />

          All Categories
        </button>

        {/* HEADER */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#087bea]
              "
            >
              Video Topics
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-[#071f55]
              "
            >
              {
                selectedCategory
                  .title
              }
            </h2>

            {selectedCategory
              .titleMal ? (
              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                {
                  selectedCategory
                    .titleMal
                }
              </p>
            ) : null}
          </div>

          {!loadingTopics &&
          topics.length >
            0 ? (
            <span
              className="
                w-fit
                rounded-full
                bg-[#edf7ff]
                px-3.5
                py-2
                text-[10px]
                font-black
                text-[#075fc8]
              "
            >
              {topics.length}{" "}
              {topics.length ===
              1
                ? "Topic"
                : "Topics"}
            </span>
          ) : null}
        </div>

        {/* ERROR */}

        {error ? (
          <div
            className="
              mt-5
              rounded-[14px]
              border
              border-red-100
              bg-red-50
              px-4
              py-3
              text-[11px]
              font-semibold
              text-red-500
            "
          >
            {error}
          </div>
        ) : null}

        {/* LOADING */}

        {loadingTopics ? (
          <LoadingState
            text="Loading topics..."
          />
        ) : topics.length >
          0 ? (
          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {topics.map(
              (topic) => (
                <button
                  key={
                    topic.id
                  }
                  type="button"
                  onClick={() =>
                    handleTopicClick(
                      topic
                    )
                  }
                  className="
                    group
                    flex
                    min-h-[150px]
                    w-full
                    flex-col
                    rounded-[20px]
                    border
                    border-[#dce8f7]
                    bg-white
                    p-5
                    text-left
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#075fc8]/30
                    hover:shadow-[0_14px_35px_rgba(22,79,165,0.09)]
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
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
                        bg-[#edf7ff]
                        text-[#087bea]
                      "
                    >
                      <BookOpen
                        size={
                          19
                        }
                      />
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-[#edf7ff]
                        px-3
                        py-1.5
                        text-[9px]
                        font-black
                        text-[#075fc8]
                      "
                    >
                      {
                        topic.chapterCount
                      }{" "}
                      {topic.chapterCount ===
                      1
                        ? "Chapter"
                        : "Chapters"}
                    </span>
                  </div>

                  <h3
                    className="
                      mt-4
                      text-[15px]
                      font-black
                      leading-6
                      text-[#071f55]
                    "
                  >
                    {
                      topic.name
                    }
                  </h3>

                  {topic.name_mal ? (
                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {
                        topic.name_mal
                      }
                    </p>
                  ) : null}

                  <div
                    className="
                      mt-auto
                      flex
                      items-center
                      justify-between
                      border-t
                      border-[#e8eef7]
                      pt-4
                    "
                  >
                    <span
                      className="
                        text-[10px]
                        font-bold
                        text-[#075fc8]
                      "
                    >
                      View chapters
                    </span>

                    <ChevronRight
                      size={16}
                      className="
                        text-[#075fc8]
                        transition
                        group-hover:translate-x-1
                      "
                    />
                  </div>
                </button>
              )
            )}
          </div>
        ) : (
          <EmptyState
            title="No topics available"
            description="No topics are currently available under this video category."
          />
        )}
      </section>
    );
  }

  /* =========================================================
     6. VIDEO CATEGORY VIEW
  ========================================================= */

  return (
    <section
      className="
        rounded-[24px]
        border
        border-[#dce8f7]
        bg-white
        p-5
        shadow-[0_12px_35px_rgba(22,79,165,0.05)]
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
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
              bg-[#edf7ff]
              text-[#087bea]
            "
          >
            <PlayCircle
              size={20}
            />
          </span>

          <div>
            <h2
              className="
                text-[16px]
                font-black
                text-[#071f55]
              "
            >
              Video Classes
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              Select a category
              to explore topics
              and lessons.
            </p>
          </div>
        </div>

        {!loadingCategories &&
        categories.length >
          0 ? (
          <span
            className="
              rounded-full
              bg-[#edf7ff]
              px-3.5
              py-2
              text-[10px]
              font-black
              text-[#075fc8]
            "
          >
            {
              categories.length
            }{" "}
            {categories.length ===
            1
              ? "Category"
              : "Categories"}
          </span>
        ) : null}
      </div>

      {loadingCategories ? (
        <LoadingState
          text="Loading video categories..."
        />
      ) : categories.length >
        0 ? (
        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {categories.map(
            (category) => (
              <button
                key={
                  category.id
                }
                type="button"
                onClick={() =>
                  handleCategoryClick(
                    category
                  )
                }
                className="
                  group
                  flex
                  min-h-[150px]
                  w-full
                  flex-col
                  rounded-[20px]
                  border
                  border-[#dce8f7]
                  bg-white
                  p-5
                  text-left
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#075fc8]/30
                  hover:shadow-[0_14px_35px_rgba(22,79,165,0.09)]
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
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
                      bg-[#edf7ff]
                      text-[#087bea]
                    "
                  >
                    <BookOpen
                      size={19}
                    />
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-[#edf7ff]
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      text-[#075fc8]
                    "
                  >
                    {
                      category.topicCount
                    }{" "}
                    {category.topicCount ===
                    1
                      ? "Topic"
                      : "Topics"}
                  </span>
                </div>

                <h3
                  className="
                    mt-4
                    text-[16px]
                    font-black
                    text-[#071f55]
                  "
                >
                  {
                    category.title
                  }
                </h3>

                {category.titleMal ? (
                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-slate-500
                    "
                  >
                    {
                      category.titleMal
                    }
                  </p>
                ) : null}

                <div
                  className="
                    mt-auto
                    flex
                    items-center
                    justify-between
                    border-t
                    border-[#e8eef7]
                    pt-4
                  "
                >
                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-[#075fc8]
                    "
                  >
                    View topics
                  </span>

                  <ChevronRight
                    size={16}
                    className="
                      text-[#075fc8]
                      transition
                      group-hover:translate-x-1
                    "
                  />
                </div>
              </button>
            )
          )}
        </div>
      ) : (
        <EmptyState
          title="No video categories available"
          description="No video categories are currently available for this exam."
        />
      )}
    </section>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState({
  text,
}) {
  return (
    <div
      className="
        flex
        min-h-[230px]
        items-center
        justify-center
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <LoaderCircle
          size={25}
          className="
            animate-spin
            text-[#075fc8]
          "
        />

        <p
          className="
            text-[11px]
            font-semibold
            text-slate-500
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div
      className="
        mt-6
        rounded-[20px]
        border
        border-dashed
        border-slate-300
        bg-white
        px-5
        py-14
        text-center
      "
    >
      <BookOpen
        size={25}
        className="
          mx-auto
          text-slate-300
        "
      />

      <h3
        className="
          mt-3
          text-sm
          font-black
          text-[#071f55]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-[11px]
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}