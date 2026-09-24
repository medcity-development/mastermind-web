import {
    Clock3,
  } from "lucide-react";
  
  /* =========================================================
     FORMAT TIME
  ========================================================= */
  
  function formatTime(
    value = 0
  ) {
    const totalSeconds =
      Math.max(
        Number(value) || 0,
        0
      );
  
    const hours =
      Math.floor(
        totalSeconds / 3600
      );
  
    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
          60
      );
  
    const seconds =
      totalSeconds % 60;
  
    const formattedMinutes =
      String(
        minutes
      ).padStart(
        2,
        "0"
      );
  
    const formattedSeconds =
      String(
        seconds
      ).padStart(
        2,
        "0"
      );
  
    /*
     * Under one hour:
     *
     * 45:12
     */
  
    if (hours <= 0) {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  
    /*
     * One hour or more:
     *
     * 01:15:30
     */
  
    const formattedHours =
      String(
        hours
      ).padStart(
        2,
        "0"
      );
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  /* =========================================================
     TIMER
  ========================================================= */
  
  export default function ExamTimer({
    remainingSeconds = 0,
    durationMinutes = 0,
  }) {
    const isFinished =
      remainingSeconds <= 0;
  
    const isUrgent =
      remainingSeconds > 0 &&
      remainingSeconds <= 300;
  
    return (
      <div
        className={`
          inline-flex
          min-w-[190px]
          items-center
          gap-3
          rounded-2xl
          border
          px-4
          py-3
          shadow-[0_8px_25px_rgba(15,23,42,0.05)]
          transition-all
          duration-300
  
          ${
            isFinished
              ? `
                border-red-200
                bg-red-50
                text-red-700
              `
              : isUrgent
                ? `
                  border-orange-200
                  bg-orange-50
                  text-orange-700
                `
                : `
                  border-[#dce8f7]
                  bg-white
                  text-[#071f55]
                `
          }
        `}
      >
        {/* =================================================
            ICON
        ================================================= */}
  
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
  
            ${
              isFinished
                ? `
                  bg-red-100
                  text-red-600
                `
                : isUrgent
                  ? `
                    bg-orange-100
                    text-orange-600
                  `
                  : `
                    bg-[#eaf5ff]
                    text-[#075fc8]
                  `
            }
          `}
        >
          <Clock3
            size={19}
          />
        </div>
  
        {/* =================================================
            CONTENT
        ================================================= */}
  
        <div>
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              opacity-60
            "
          >
            {isFinished
              ? "Time Ended"
              : "Time Remaining"}
          </p>
  
          <p
            className="
              mt-0.5
              text-xl
              font-black
              leading-none
              tabular-nums
            "
          >
            {formatTime(
              remainingSeconds
            )}
          </p>
  
          {durationMinutes > 0 ? (
            <p
              className="
                mt-1
                text-[9px]
                font-semibold
                opacity-50
              "
            >
              {durationMinutes} min
              exam
            </p>
          ) : null}
        </div>
      </div>
    );
  }