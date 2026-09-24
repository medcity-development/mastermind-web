import { Quote, Target } from "lucide-react";

export default function MotivationCard() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-[#f3dce9]
        bg-gradient-to-br
        from-[#fff1f8]
        to-[#ffeaf5]
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <Quote
            className="
              mb-2
              h-7
              w-7
              fill-[#173e9d]
              text-[#173e9d]
            "
          />

          <p
            className="
              max-w-[190px]
              text-lg
              font-black
              leading-6
              text-[#082b7a]
            "
          >
            Small steps
            <br />
            every day lead to
            <br />
            big results.
          </p>
        </div>

        <div
          className="
            flex
            h-20
            w-20
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#ffc5df]
            text-[#ff2a8b]
          "
        >
          <Target className="h-12 w-12" />
        </div>
      </div>
    </section>
  );
}