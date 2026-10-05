import {
    History,
} from "lucide-react";

import ExamHistoryTable from "./ExamHistoryTable";
import ExamHistoryEmpty from "./ExamHistoryEmpty";

export default function ExamHistorySection({
    attempts = [],
}) {
    return (
        <section
            className="
        mt-6

        overflow-hidden

        rounded-[28px]

        border
        border-[#dce8f7]

        bg-white

        shadow-[0_18px_50px_rgba(15,23,42,0.055)]
      "
        >
            <header
                className="
          flex
          items-center
          justify-between
          gap-4

          border-b
          border-[#e1ebf6]

          bg-gradient-to-r
          from-white
          via-[#f7fbff]
          to-[#f4f2ff]

          px-6
          py-5
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
              h-11
              w-11
              items-center
              justify-center

              rounded-[14px]

              bg-gradient-to-br
              from-[#164fa5]
              to-[#017dc0]

              text-white
            "
                    >
                        <History
                            size={19}
                        />
                    </div>

                    <div>
                        <p
                            className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.15em]
                text-[#017dc0]
              "
                        >
                            Activity
                        </p>

                        <h2
                            className="
                text-[19px]
                font-black
                text-[#071f55]
              "
                        >
                            Exam History
                        </h2>
                    </div>
                </div>

                <span
                    className="
            rounded-full

            border
            border-blue-100

            bg-white

            px-3
            py-2

            text-[9px]
            font-black

            text-[#017dc0]
          "
                >
                    {attempts.length} records
                </span>
            </header>

            {attempts.length ? (
                <>
                    <ExamHistoryTable
                        attempts={
                            attempts
                        }
                    />

                    <footer
                        className="
              flex
              items-center
              justify-between

              border-t
              border-slate-100

              bg-[#fbfdff]

              px-6
              py-3

              text-[9px]
              text-slate-400
            "
                    >
                        <span>
                            {
                                attempts.length
                            } saved attempts
                        </span>

                        <span
                            className="
                font-bold
                text-[#017dc0]
              "
                        >
                            Scroll to view more
                        </span>
                    </footer>
                </>
            ) : (
                <ExamHistoryEmpty />
            )}
        </section>
    );
}