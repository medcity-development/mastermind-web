import StatementExamCard from "./StatementExamCard";

export default function StatementExamList({
  exams = [],
  topicName,
  statementTypeSlug,
  cid,
  uid = 0,
  type = "tst",
  examName,
  shortName,
  governmentExamsSlug,
}) {
  return (
    <section className="mt-8">
      {/* ================================================
          HEADER
      ================================================= */}

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
              ? `${examName} Statement Practice`
              : "Statement Practice"}
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-black
              text-[#071f55]
            "
          >
            Available Exams
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Select a {topicName} exam
            to continue.
          </p>
        </div>

        <div
          className="
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
              text-xs
              font-bold
              text-slate-500
            "
          >
            {exams.length} Exams
          </p>
        </div>
      </div>

      {/* ================================================
          EMPTY
      ================================================= */}

      {!exams.length ? (
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
            No exams available
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            No statement type exams
            are currently available for
            this topic.
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
          {exams.map(
            (exam) => (
              <StatementExamCard
                key={exam.id}
                exam={exam}
                topicName={
                  topicName
                }
                statementTypeSlug={
                  statementTypeSlug
                }
                cid={cid}
                uid={uid}
                type={type}
                examName={
                  examName
                }
                shortName={
                  shortName
                }
                governmentExamsSlug={
                  governmentExamsSlug
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
}