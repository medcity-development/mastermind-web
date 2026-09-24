import Image from "next/image";

import student1 from "./images/student1.png";
import student2 from "./images/student2.png";
import student3 from "./images/student3.png";
import student4 from "./images/student4.png";
import student5 from "./images/student5.png";
import student6 from "./images/student6.png";
import student7 from "./images/student7.png";
import student8 from "./images/student8.png";
import student9 from "./images/student9.png";
import student10 from "./images/student10.png";

const portraits = [
  {
    src: student7,
    className:
      "left-[1%] top-[92px] h-[154px] w-[106px]",
    rotate: "-rotate-[1.5deg]",
  },
  {
    src: student2,
    className:
      "left-[9%] top-[20px] h-[172px] w-[116px]",
    rotate: "rotate-[1deg]",
  },
  {
    src: student9,
    className:
      "left-[18%] top-[112px] h-[148px] w-[102px]",
    rotate: "-rotate-[0.8deg]",
  },
  {
    src: student4,
    className:
      "left-[28%] top-[42px] h-[178px] w-[120px]",
    rotate: "rotate-[1.1deg]",
  },
  {
    src: student1,
    className:
      "left-[39%] top-[5px] h-[186px] w-[126px]",
    rotate: "-rotate-[0.7deg]",
  },

  {
    src: student8,
    className:
      "right-[39%] top-[72px] h-[168px] w-[114px]",
    rotate: "rotate-[0.8deg]",
  },
  {
    src: student3,
    className:
      "right-[28%] top-[20px] h-[180px] w-[122px]",
    rotate: "-rotate-[1deg]",
  },
  {
    src: student10,
    className:
      "right-[18%] top-[112px] h-[148px] w-[102px]",
    rotate: "rotate-[1.1deg]",
  },
  {
    src: student5,
    className:
      "right-[9%] top-[14px] h-[170px] w-[114px]",
    rotate: "-rotate-[0.8deg]",
  },
  {
    src: student6,
    className:
      "right-[1%] top-[92px] h-[154px] w-[106px]",
    rotate: "rotate-[1deg]",
  },
];

export default function TestimonialsPortraits() {
  return (
    <div
      aria-hidden="true"
      className="
        relative
        mx-auto
        hidden
        h-[300px]
        w-full
        max-w-[1500px]
        lg:block mt-10
      "  data-aos="fade-right"
    >
      {/* soft background columns */}
      <div
        className="
          pointer-events-none
          absolute
          left-[3%]
          top-0
          h-[250px]
          w-[120px]
          rounded-b-[28px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-[21%]
          top-0
          h-[220px]
          w-[110px]
          rounded-b-[28px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[21%]
          top-0
          h-[220px]
          w-[110px]
          rounded-b-[28px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[3%]
          top-0
          h-[250px]
          w-[120px]
          rounded-b-[28px]
        "
      />

      {/* clean center opening */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[245px]
          w-[310px]
          -translate-x-1/2
          rounded-b-[42px]
        "
      />

      {/* portraits */}
      {portraits.map((portrait, index) => (
        <div
          key={index}
          className={`
            group
            absolute
            z-10
            overflow-hidden
            rounded-[18px]
            border
            border-white/90
            bg-white
            p-[3px]
            shadow-[0_14px_32px_rgba(8,31,92,0.11)]

            transition-all
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]

            hover:z-30
            hover:-translate-y-2
            hover:rotate-0
            hover:scale-[1.045]
            hover:shadow-[0_22px_48px_rgba(8,31,92,0.17)]

            ${portrait.className}
            ${portrait.rotate}
          `}
        >
          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
              rounded-[15px]
              bg-[#edf4f8]
            "
          >
            <Image
              src={portrait.src}
              alt=""
              fill
              priority={index < 4}
              sizes="130px"
              className="
                object-cover
                object-center
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.04]
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-[#081f5c]/7
                via-transparent
                to-white/5
              "
            />
          </div>
        </div>
      ))}

    </div>
  );
}