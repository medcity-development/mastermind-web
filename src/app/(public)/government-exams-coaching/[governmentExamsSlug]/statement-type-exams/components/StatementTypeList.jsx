import StatementTypeCard from "./StatementTypeCard";
import StatementTypePagination from "./StatementTypePagination";

export default function StatementTypeList({
  topics = [],
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  cid,
  examName,
  governmentExamsSlug,
  uid = 0,
  type = "tst",
}) {
  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endItem =
    Math.min(
      currentPage *
        itemsPerPage,
      totalItems
    );

  return (
    <section className="mt-8">
      <div
        className="
          mb-5
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
              tracking-[0.14em]
              text-pink-500
            "
          >
            {examName
              ? `${examName} Practice`
              : "Practice by Topic"}
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-black
              text-[#071f55]
            "
          >
            Choose a Topic
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Select a topic to view
            statement type exams.
          </p>
        </div>

        {totalItems > 0 && (
          <div
            className="
              w-fit
              rounded-full
              border
              border-slate-200
              bg-white
              px-4
              py-2
              shadow-sm
            "
          >
            <p
              className="
                text-[11px]
                font-bold
                text-slate-500
              "
            >
              Showing{" "}
              <span className="text-[#071f55]">
                {startItem} - {endItem}
              </span>{" "}
              of{" "}
              <span className="text-[#071f55]">
                {totalItems}
              </span>
            </p>
          </div>
        )}
      </div>

      {!topics.length ? (
        <div
          className="
            rounded-[24px]
            border
            border-slate-200
            bg-white
            p-10
            text-center
          "
        >
          <h3
            className="
              font-black
              text-[#071f55]
            "
          >
            No topics available
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Statement type topics are
            currently unavailable.
          </p>
        </div>
      ) : (
        <div
          className="
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
              <StatementTypeCard
                key={item.id}
                item={item}
                cid={cid}
                uid={uid}
                type={type}
                examName={examName}
                governmentExamsSlug={
                  governmentExamsSlug
                }
              />
            )
          )}
        </div>
      )}

      <StatementTypePagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </section>
  );
}