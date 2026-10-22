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

function extractArray(result) {
  if (Array.isArray(result?.items)) {
    return result.items;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.details)) {
    return result.details;
  }

  return [];
}

function normalizeCategory(item) {
  return {
    ...item,
    id:
      item.id ??
      item.subjectid ??
      item.subject_id,
    title:
      item.subject ??
      item.name ??
      item.title ??
      "Video Category",
    titleMal:
      item.subject_mal ??
      item.name_mal ??
      "",
    count: Number(
      item.chapter_count ??
      item.count ??
      0
    ),
  };
}

function normalizeTopic(item) {
  return {
    ...item,
    id:
      item.id ??
      item.topicid ??
      item.topic_id,
    name:
      item.name ??
      item.topic ??
      item.title ??
      "Topic",
    name_mal:
      item.name_mal ??
      item.topic_mal ??
      "",
    count: Number(
      item.count ??
      item.chapter_count ??
      0
    ),
    mockTestId:
      item.mocktest ??
      item.mock_test ??
      item.mocktest_id ??
      item.mockTest ??
      null,
  };
}

function resolveMockTestId(result, topic) {
  const candidates = [
    result?.mocktest,
    result?.mock_test,
    result?.mocktest_id,
    result?.mockTest,
    result?.details?.mocktest,
    result?.details?.mocktest_id,
    topic?.mockTestId,
  ];

  for (const value of candidates) {
    const id = Number(value);

    if (
      Number.isSafeInteger(id) &&
      id > 0
    ) {
      return id;
    }
  }

  return null;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal,
  });

  const result = await response.json();

  if (!response.ok || result?.status === false) {
    throw new Error(
      result?.message ||
      "Unable to load data."
    );
  }

  return result;
}

function Loading({ label }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-slate-500">
      <LoaderCircle
        size={24}
        className="animate-spin text-blue-600"
      />
      <p className="text-xs font-semibold">
        {label}
      </p>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export default function TopicWiseTab({
  cid = 1,
  uid = 0,
  examId,
  onLoginRequired,
  onStartMockTest,
}) {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [selectedTopic, setSelectedTopic] =
    useState(null);

  const [mockTestId, setMockTestId] =
    useState(null);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingTopics, setLoadingTopics] =
    useState(false);

  const [loadingChapters, setLoadingChapters] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) {
      setLoadingCategories(false);
      return;
    }

    const controller = new AbortController();

    async function loadCategories() {
      setLoadingCategories(true);
      setCategories([]);
      setSelectedCategory(null);
      setSelectedTopic(null);
      setTopics([]);
      setChapters([]);
      setMockTestId(null);
      setError("");

      try {
        const params = new URLSearchParams({
          uid: String(uid),
          cid: String(cid),
          examId: String(examId),
        });

        const result = await fetchJson(
          `/api/sub-exam-video-source?${params}`,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setCategories(
            extractArray(result)
              .map(normalizeCategory)
              .filter((item) => item.id != null)
          );
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, [uid, cid, examId]);

  async function handleCategoryClick(category) {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setTopics([]);
    setChapters([]);
    setMockTestId(null);
    setLoadingTopics(true);
    setError("");

    try {
      const params = new URLSearchParams({
        uid: String(uid),
        cid: String(cid),
        subId: String(category.id),
        subExamId: String(examId),
      });

      const result = await fetchJson(
        `/api/sub-exam-topics?${params}`
      );

      setTopics(
        extractArray(result)
          .map(normalizeTopic)
          .filter((item) => item.id != null)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTopics(false);
    }
  }

  async function handleTopicClick(topic) {
    setSelectedTopic(topic);
    setChapters([]);
    setMockTestId(null);
    setLoadingChapters(true);
    setError("");

    try {
      const params = new URLSearchParams({
        uid: String(uid),
        cid: String(cid),
        topicId: String(topic.id),
        offset: "0",
      });

      const result = await fetchJson(
        `/api/sub-exam-topic-chapters?${params}`
      );

      const chapterList = extractArray(result);

      setChapters(chapterList);

      const linkedId = resolveMockTestId(
        result,
        topic
      );

      console.log("STUDYPLAN LINK:", {
        topicId: topic.id,
        mockTestId: linkedId,
      });

      setMockTestId(linkedId);
    } catch (err) {
      setError(err.message);
      setMockTestId(null);
    } finally {
      setLoadingChapters(false);
    }
  }

  function backToTopics() {
    setSelectedTopic(null);
    setChapters([]);
    setMockTestId(null);
    setError("");
  }

  if (selectedCategory && selectedTopic) {
    return (
      <div>
        <TopicChapterList
          key={selectedTopic.id}
          topic={selectedTopic}
          chapters={chapters}
          loading={loadingChapters}
          error={error}
          onBack={backToTopics}
          mockTestId={mockTestId}
          cid={cid}
          uid={uid}
          onLoginRequired={onLoginRequired}
          onStartMockTest={onStartMockTest}
        />
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            setTopics([]);
            setError("");
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-700"
        >
          <ArrowLeft size={16} />
          All Categories
        </button>

        <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            Video Topics
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#071f55]">
            {selectedCategory.title}
          </h2>

          {selectedCategory.titleMal && (
            <p className="mt-2 text-sm text-slate-500">
              {selectedCategory.titleMal}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-5 text-sm text-red-600">
            {error}
          </p>
        )}

        {loadingTopics ? (
          <Loading label="Loading topics..." />
        ) : topics.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className="group flex min-h-[155px] flex-col rounded-[20px] border border-blue-100 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <BookOpen size={19} />
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                    {topic.count} Chapters
                  </span>
                </div>

                <h3 className="mt-4 text-base font-black text-[#071f55]">
                  {topic.name}
                </h3>

                {topic.name_mal && (
                  <p className="mt-1 text-xs text-slate-500">
                    {topic.name_mal}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-blue-700">
                  View chapters
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Empty message="No topics available." />
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <PlayCircle size={21} />
        </span>

        <div>
          <h2 className="text-lg font-black text-[#071f55]">
            Video Classes
          </h2>

          <p className="text-xs text-slate-500">
            Select a category to explore topics.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-5 text-sm text-red-600">
          {error}
        </p>
      )}

      {loadingCategories ? (
        <Loading label="Loading video categories..." />
      ) : categories.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className="group flex min-h-[155px] flex-col rounded-[20px] border border-blue-100 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <BookOpen size={19} />
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                  {category.count} Topics
                </span>
              </div>

              <h3 className="mt-4 text-base font-black text-[#071f55]">
                {category.title}
              </h3>

              {category.titleMal && (
                <p className="mt-1 text-xs text-slate-500">
                  {category.titleMal}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-blue-700">
                View topics
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Empty message="No video categories available." />
      )}
    </section>
  );
}