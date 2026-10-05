"use client";

import MockPauseButton from "./MockPauseButton";
import MockSubmitButton from "./MockSubmitButton";

export default function MockTestActions({
    onPause,
    onSubmit,

    saving = false,
    resultLoading = false,
    submitted = false,
    isPaused = false,
    timeEnded = false,
}) {
    return (
        <div
            className="
        flex
        flex-col
        gap-3
        border-t
        border-slate-100
        bg-[#f8fbff]
        px-5
        py-5

        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-7
      "
        >
            <MockPauseButton
                onPause={
                    onPause
                }
                saving={
                    saving ||
                    submitted ||
                    timeEnded
                }
                paused={
                    isPaused
                }
            />

            <MockSubmitButton
                onSubmit={
                    onSubmit
                }
                saving={
                    saving ||
                    resultLoading
                }
                submitted={
                    submitted
                }
                disabled={
                    isPaused ||
                    timeEnded
                }
            />
        </div>
    );
}