import {
  formatStatus,
} from "../utils/performanceAnalysisUtils";

function StatusBadge({
  value,
}) {
  const status =
    formatStatus(
      value
    );

  const completed =
    status ===
    "Completed";

  const paused =
    status ===
    "Paused";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1.5
        text-[9px]
        font-black
        uppercase

        ${
          completed
            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
            : paused
              ? "border-amber-100 bg-amber-50 text-amber-600"
              : "border-slate-200 bg-slate-50 text-slate-500"
        }
      `}
    >
      {status}
    </span>
  );
}

function Heading({
  children,
}) {
  return (
    <th
      className="
        px-5
        py-4

        text-[8px]
        font-black
        uppercase
        tracking-[0.13em]

        text-slate-400
      "
    >
      {children}
    </th>
  );
}

function MetricCell({
  value,
  className = "",
}) {
  return (
    <td
      className="
        px-5
        py-4
      "
    >
      <span
        className={`
          text-[11px]
          font-black
          text-[#071f55]

          ${className}
        `}
      >
        {value}
      </span>
    </td>
  );
}

export default function ExamHistoryTable({
  attempts = [],
}) {
  return (
    <div
      className="
        max-h-[560px]
        overflow-auto
      "
    >
      <table
        className="
          w-full
          min-w-[950px]

          border-collapse

          text-left
        "
      >
        <thead
          className="
            sticky
            top-0
            z-20

            bg-[#f7faff]/95

            shadow-[0_1px_0_#dce8f7]

            backdrop-blur-xl
          "
        >
          <tr>
            <Heading>
              Exam
            </Heading>

            <Heading>
              Type
            </Heading>

            <Heading>
              Status
            </Heading>

            <Heading>
              Attempted
            </Heading>

            <Heading>
              Correct
            </Heading>

            <Heading>
              Wrong
            </Heading>

            <Heading>
              Score
            </Heading>
          </tr>
        </thead>

        <tbody>
          {attempts.map(
            (
              attempt,
              index
            ) => (
              <tr
                key={`${attempt.examType}-${attempt.attemptId}`}
                className="
                  group
                  border-b
                  border-slate-100

                  transition

                  hover:bg-[#f8fbff]
                "
              >
                <td
                  className="
                    px-5
                    py-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center

                        rounded-[10px]

                        bg-blue-50

                        text-[9px]
                        font-black
                        text-[#017dc0]
                      "
                    >
                      {index + 1}
                    </div>

                    <div
                      className="
                        min-w-0
                      "
                    >
                      <p
                        className="
                          max-w-[260px]
                          truncate

                          text-[11px]
                          font-extrabold

                          text-[#071f55]
                        "
                        title={
                          attempt.title
                        }
                      >
                        {attempt.title}
                      </p>

                      <p
                        className="
                          mt-1

                          text-[8px]
                          font-semibold
                          uppercase

                          text-slate-400
                        "
                      >
                        Attempt #
                        {
                          attempt.attemptId
                        }
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="
                    px-5
                    py-4
                  "
                >
                  <span
                    className="
                      rounded-full

                      bg-blue-50

                      px-2.5
                      py-1.5

                      text-[9px]
                      font-black

                      text-[#017dc0]
                    "
                  >
                    {
                      attempt.examLabel
                    }
                  </span>
                </td>

                <td
                  className="
                    px-5
                    py-4
                  "
                >
                  <StatusBadge
                    value={
                      attempt.status
                    }
                  />
                </td>

                <MetricCell
                  value={
                    attempt.attempted
                  }
                />

                <MetricCell
                  value={
                    attempt.correct
                  }
                  className="
                    text-emerald-600
                  "
                />

                <MetricCell
                  value={
                    attempt.wrong
                  }
                  className="
                    text-red-500
                  "
                />

                <td
                  className="
                    px-5
                    py-4
                  "
                >
                  <span
                    className="
                      inline-flex
                      items-baseline
                      gap-1

                      rounded-[10px]

                      bg-[#071f55]

                      px-3
                      py-2

                      text-white
                    "
                  >
                    <strong>
                      {
                        attempt.score
                      }
                    </strong>

                    <span
                      className="
                        text-[8px]
                        text-white/50
                      "
                    >
                      /
                      {
                        attempt.totalMark
                      }
                    </span>
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}