import {
  CheckCircle2,
  Target,
  XCircle,
} from "lucide-react";

export default function ExamSummaryCards({
  counts,
}) {
  const attempted =
    Number(
      counts?.attempted ??
      0
    );

  const correct =
    Number(
      counts?.correct ??
      0
    );

  const wrong =
    Number(
      counts?.wrong ??
      0
    );

  const cards = [
    {
      label:
        "Attempted",

      value:
        attempted,

      icon:
        Target,
    },

    {
      label:
        "Correct",

      value:
        correct,

      icon:
        CheckCircle2,
    },

    {
      label:
        "Wrong",

      value:
        wrong,

      icon:
        XCircle,
    },
  ];

  return (
    <section
      className="
        grid
        gap-4
        md:grid-cols-3
      "
    >
      {cards.map(
        ({
          label,
          value,
          icon: Icon,
        }) => (
          <div
            key={label}
            className="
              flex
              items-center
              justify-between
              rounded-[20px]
              border
              border-[#dbe7f5]
              bg-white
              px-5
              py-5
              shadow-sm
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-slate-400
                "
              >
                {label}
              </p>

              <p
                className="
                  mt-2
                  text-[25px]
                  font-black
                  text-[#082e5a]
                "
              >
                {value}
              </p>
            </div>

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-[14px]
                bg-[#eaf7fd]
                text-[#017dc0]
              "
            >
              <Icon
                size={20}
                strokeWidth={
                  2
                }
              />
            </div>
          </div>
        )
      )}
    </section>
  );
}