import {
    Clock3,
  } from "lucide-react";
  
  export default function ScertTimer({
    remainingSeconds,
  }) {
    return (
      <div
        className="
          flex
          min-w-[150px]
          items-center
          gap-3
          rounded-xl
          bg-[#071f55]
          px-4
          py-3
          text-white
        "
      >
        <Clock3 size={20} />
  
        <div>
          <p className="text-[10px] text-blue-200">
            Time Remaining
          </p>
  
          <p className="font-black tabular-nums">
            {formatTime(
              remainingSeconds
            )}
          </p>
        </div>
      </div>
    );
  }
  
  function formatTime(
    totalSeconds
  ) {
    const seconds =
      Math.max(
        Number(
          totalSeconds
        ) || 0,
        0
      );
  
    const hours =
      Math.floor(
        seconds / 3600
      );
  
    const minutes =
      Math.floor(
        (seconds % 3600) /
          60
      );
  
    const remaining =
      seconds % 60;
  
    return [
      hours,
      minutes,
      remaining,
    ]
      .map((value) =>
        String(value).padStart(
          2,
          "0"
        )
      )
      .join(":");
  }