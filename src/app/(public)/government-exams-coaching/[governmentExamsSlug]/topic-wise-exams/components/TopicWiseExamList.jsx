import TopicWiseExamCard from "./TopicWiseExamCard";
import TopicWisePagination from "./TopicWisePagination";

export default function TopicWiseExamList({
  topics = [],
  cid,
  uid = 0,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  governmentExamsSlug,
  examName,
  basePath,
}) {
  const root =
    basePath ||
    `${Number(uid) > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const first = totalItems
    ? (currentPage - 1) * itemsPerPage + 1
    : 0;

  const last = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <section className="mt-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#017dc0]">
            {examName || "Government Exam"} Practice
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#071f55]">
            Choose a Topic
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select a topic to view its available practice exams.
          </p>
        </div>

        {!!totalItems && (
          <p className="rounded-full border bg-white px-4 py-2 text-xs text-slate-500">
            Showing {first}–{last} of {totalItems}
          </p>
        )}
      </div>

      {topics.length ? (
        <>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topics.map((item) => (
              <TopicWiseExamCard
                key={item.id}
                item={item}
                uid={uid}
                governmentExamsSlug={governmentExamsSlug}
                examName={examName}
                basePath={root}
              />
            ))}
          </div>

          <TopicWisePagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={root}
            governmentExamsSlug={governmentExamsSlug}
            uid={uid}
          />
        </>
      ) : (
        <p className="mt-7 rounded-2xl border border-dashed bg-white p-10 text-center text-slate-500">
          No topics are currently available.
        </p>
      )}
    </section>
  );
}