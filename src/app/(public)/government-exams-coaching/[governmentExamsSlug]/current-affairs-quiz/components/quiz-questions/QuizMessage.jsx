import {
    Brain,
    LoaderCircle,
    TriangleAlert,
  } from "lucide-react";
  
  export default function QuizMessage({
    type = "empty",
    message,
  }) {
    if (
      type === "loading"
    ) {
      return (
        <div
          className="
            mt-6
            flex
            min-h-[260px]
            items-center
            justify-center
            rounded-[24px]
            border
            border-[#dce8f7]
            bg-gradient-to-br
            from-[#f5faff]
            via-white
            to-[#f5f3ff]
          "
        >
          <div
            className="
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[18px]
                bg-[#eef6ff]
              "
            >
              <LoaderCircle
                size={26}
                className="
                  animate-spin
                  text-[#087bea]
                "
              />
            </div>
  
            <p
              className="
                mt-3
                text-[11px]
                font-bold
                text-slate-400
              "
            >
              {message}
            </p>
          </div>
        </div>
      );
    }
  
    if (
      type === "error"
    ) {
      return (
        <div
          className="
            mt-6
            rounded-[22px]
            border
            border-rose-200
            bg-gradient-to-r
            from-rose-50
            to-orange-50
            px-6
            py-10
            text-center
          "
        >
          <TriangleAlert
            size={28}
            className="
              mx-auto
              text-rose-400
            "
          />
  
          <p
            className="
              mt-3
              text-sm
              font-bold
              text-rose-600
            "
          >
            {message}
          </p>
        </div>
      );
    }
  
    return (
      <div
        className="
          mt-6
          rounded-[24px]
          border
          border-dashed
          border-[#dce8f7]
          bg-gradient-to-r
          from-[#f8fbff]
          to-[#faf7ff]
          px-6
          py-14
          text-center
        "
      >
        <Brain
          size={32}
          className="
            mx-auto
            text-[#a5b4fc]
          "
        />
  
        <p
          className="
            mt-3
            text-sm
            font-bold
            text-slate-500
          "
        >
          {message}
        </p>
      </div>
    );
  }