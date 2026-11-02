"use client";

import { Clock3 } from "lucide-react";

export default function ExamTimer({ seconds = 0 }) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return (
    <div
      role="timer"
      aria-live="off"
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${
        safeSeconds <= 60
          ? "bg-red-50 text-red-700"
          : "bg-blue-50 text-blue-800"
      }`}
    >
      <Clock3 size={17} />
      {String(minutes).padStart(2, "0")}:{String(remainder).padStart(2, "0")}
    </div>
  );
}
