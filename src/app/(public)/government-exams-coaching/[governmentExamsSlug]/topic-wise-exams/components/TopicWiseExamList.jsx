import TopicWiseExamCard from "./TopicWiseExamCard";
import TopicWisePagination from "./TopicWisePagination";

export default function TopicWiseExamList({
  topics = [],
  cid,
  uid = 0,
  type = "twe",
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  governmentExamsSlug,
  examName,
}) {
  const firstItem =
    totalItems > 0
      ? (currentPage - 1) *
          itemsPerPage +
        1
      : 0;

  const lastItem =
    totalItems > 0
      ? Math.min(
          currentPage *
            itemsPerPage,
          totalItems
        )
      : 0;

  return (
    <section className="mt-9">
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-[#017dc0]
            "
          >
            {examName
              ? `${examName} Practice`
              : "Practice by Topic"}
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              text-[#071f55]
              sm:text-3xl
            "
          >
            Choose a Topic
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Select a topic to continue
            with the available practice
            exams.
          </p>
        </div>

        {totalItems > 0 && (
          <div
            className="
              shrink-0
              rounded-full
              border
              border-[#dce8f7]
              bg-white
              px-4
              py-2
              text-[11px]
              font-semibold
              text-slate-500
              shadow-sm
            "
          >
            Showing{" "}
            <span className="font-black text-[#071f55]">
              {firstItem}
            </span>
            {" - "}
            <span className="font-black text-[#071f55]">
              {lastItem}
            </span>
            {" of "}
            <span className="font-black text-[#071f55]">
              {totalItems}
            </span>
          </div>
        )}
      </div>

      {topics.length > 0 ? (
        <>
          <div
            className="
              mt-7
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {topics.map(
              (item) => (
             <TopicWiseExamCard
  key={item.id}
  item={item}
  cid={cid}
  uid={uid}
  governmentExamsSlug={
    governmentExamsSlug
  }
  examName={examName}
/>
              )
            )}
          </div>

          <TopicWisePagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
          />
        </>
      ) : (
        <div
          className="
            mt-7
            rounded-[22px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-14
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            No topics are currently
            available.
          </p>
        </div>
      )}
    </section>
  );
}