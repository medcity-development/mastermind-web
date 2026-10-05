import {
    useEffect,
    useState,
} from "react";

export default function useMockExamTimer({
    submitted = false,
    saving = false,
    isPaused = false,
}) {
    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(0);

    const [
        timerStarted,
        setTimerStarted,
    ] = useState(false);

    useEffect(() => {
        if (
            !timerStarted ||
            isPaused ||
            submitted ||
            saving ||
            remainingSeconds <= 0
        ) {
            return;
        }

        const interval =
            window.setInterval(
                () => {
                    setRemainingSeconds(
                        (previous) =>
                            previous <= 1
                                ? 0
                                : previous - 1
                    );
                },
                1000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [
        timerStarted,
        isPaused,
        submitted,
        saving,
        remainingSeconds,
    ]);

    function startTimer(
        seconds
    ) {
        const value =
            Math.max(
                0,
                Number(seconds) ||
                0
            );

        setRemainingSeconds(
            value
        );

        setTimerStarted(
            true
        );
    }

    function stopTimer() {
        setTimerStarted(
            false
        );
    }

    return {
        remainingSeconds,
        setRemainingSeconds,

        timerStarted,
        setTimerStarted,

        startTimer,
        stopTimer,

        timeEnded:
            remainingSeconds <= 0,
    };
}