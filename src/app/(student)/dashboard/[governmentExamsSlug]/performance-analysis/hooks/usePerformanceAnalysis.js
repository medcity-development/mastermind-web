"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPerformanceSummary, EXAM_TYPES, getTimestamp, loadTypeAttempts } from "../utils/performanceAnalysisUtils";

// Memory-only snapshots are isolated by student and course and refreshed on entry.
const snapshots = new Map();
const SNAPSHOT_TTL = 60_000;

export default function usePerformanceAnalysis({ cid, uid }) {
    const cacheKey = JSON.stringify([String(uid), String(cid)]);
    const [state, setState] = useState(() => {
        const cached = snapshots.get(cacheKey);
        const usable = cached && cached.expiresAt > Date.now();
        return { attempts: usable ? cached.attempts : [], loading: !usable, refreshing: true, completed: 0, error: "" };
    });

    useEffect(() => {
        let cancelled = false;
        const results = new Map();
        const errors = [];
        let completed = 0;
        // Keep cached totals intact until the complete refresh is available.
        const cached = snapshots.get(cacheKey);
        const hasSnapshot = cached && cached.expiresAt > Date.now();

        async function loadType(type) {
            try {
                const rows = await loadTypeAttempts({ cid, uid, examType: type.examType, examLabel: type.label });
                results.set(type.examType, rows);
            } catch (error) {
                errors.push(error?.message || `Unable to load ${type.label}.`);
            }
            completed += 1;
            if (cancelled) return;
            const done = completed === EXAM_TYPES.length;
            const attempts = [...results.values()].flat().sort((a, b) => getTimestamp(b) - getTimestamp(a));
            if (done && !errors.length) {
                snapshots.delete(cacheKey);
                snapshots.set(cacheKey, { attempts, expiresAt: Date.now() + SNAPSHOT_TTL });
                while (snapshots.size > 10) snapshots.delete(snapshots.keys().next().value);
            }
            setState(previous => ({
                attempts: hasSnapshot && (!done || errors.length) ? previous.attempts : attempts,
                loading: !done && !hasSnapshot && results.size === 0,
                refreshing: !done,
                completed,
                error: errors.join(" "),
            }));
        }

        EXAM_TYPES.forEach(type => { void loadType(type); });
        return () => { cancelled = true; };
    }, [cacheKey, cid, uid]);

    const summary = useMemo(() => buildPerformanceSummary(state.attempts), [state.attempts]);
    return { ...state, summary, totalTypes: EXAM_TYPES.length };
}
