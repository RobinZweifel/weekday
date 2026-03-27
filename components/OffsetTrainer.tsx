"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkOffsetAnswer,
  createOffsetChallenge,
  type OffsetChallenge,
} from "@/app/actions/offset-challenge";
import { WEEKDAY_NAMES_SUN0 } from "@/lib/weekday-offset";
import { WEEKDAYS_MON_FIRST, weekdayShortLabel } from "@/lib/weekday-buttons";
import { WeekdayPickerGrid } from "@/components/WeekdayPickerGrid";

const STATS_KEY = "weekday-offset-drill-stats";
const HISTORY_LEN = 20;

type DrillStats = { streak: number; history: boolean[] };

function loadStats(): DrillStats {
  if (typeof window === "undefined") return { streak: 0, history: [] };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { streak: 0, history: [] };
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return { streak: 0, history: [] };
    const streak = Number((p as DrillStats).streak);
    const history = (p as DrillStats).history;
    return {
      streak: Number.isFinite(streak) ? Math.max(0, streak) : 0,
      history: Array.isArray(history)
        ? history.filter((x): x is boolean => typeof x === "boolean").slice(-HISTORY_LEN)
        : [],
    };
  } catch {
    return { streak: 0, history: [] };
  }
}

function saveStats(s: DrillStats) {
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({
      streak: s.streak,
      history: s.history.slice(-HISTORY_LEN),
    })
  );
}

export function OffsetTrainer() {
  const [challenge, setChallenge] = useState<OffsetChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"guess" | "revealed">("guess");
  const [result, setResult] = useState<{
    correct: boolean;
    actualWeekday: number;
  } | null>(null);
  const [stats, setStats] = useState<DrillStats>({ streak: 0, history: [] });

  const fetchChallenge = useCallback(async () => {
    setLoading(true);
    setPhase("guess");
    setResult(null);
    try {
      const next = await createOffsetChallenge();
      setChallenge(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    void fetchChallenge();
  }, [fetchChallenge]);

  const accuracy =
    stats.history.length === 0
      ? null
      : Math.round(
          (stats.history.filter(Boolean).length / stats.history.length) * 100
        );

  const handleGuess = useCallback(
    async (weekday: number) => {
      if (!challenge || phase !== "guess" || submitting) return;
      setSubmitting(true);
      try {
        const r = await checkOffsetAnswer({
          baseWeekday: challenge.baseWeekday,
          days: challenge.days,
          direction: challenge.direction,
          weekday,
        });
        setResult(r);
        setPhase("revealed");
        setStats((prev) => {
          const nextStreak = r.correct ? prev.streak + 1 : 0;
          const nextHistory = [...prev.history, r.correct].slice(-HISTORY_LEN);
          const next = { streak: nextStreak, history: nextHistory };
          saveStats(next);
          return next;
        });
      } finally {
        setSubmitting(false);
      }
    },
    [challenge, phase, submitting]
  );

  const handleNext = () => {
    void fetchChallenge();
  };

  useEffect(() => {
    if (phase !== "guess" || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const n = e.key;
      if (n < "1" || n > "7") return;
      const idx = Number(n) - 1;
      const wd = WEEKDAYS_MON_FIRST[idx]?.value;
      if (wd !== undefined) void handleGuess(wd);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, loading, handleGuess]);

  const baseName = challenge
    ? WEEKDAY_NAMES_SUN0[challenge.baseWeekday]
    : "";
  const baseLower = baseName ? baseName.toLowerCase() : "";
  const compactLine =
    challenge &&
    (challenge.direction === "add"
      ? `${baseLower} plus ${challenge.days}`
      : `${baseLower} -${challenge.days}`);
  const challengeAria =
    challenge &&
    (challenge.direction === "add"
      ? `${baseName} plus ${challenge.days} days — which weekday?`
      : `${baseName} minus ${challenge.days} days — which weekday?`);

  return (
    <div className="w-full max-w-lg min-w-0 px-1 sm:px-0">
      <div className="mb-2 flex justify-end sm:mb-3">
        <div
          className="flex min-w-0 flex-col items-end gap-0.5 text-right text-xs text-zinc-500 tabular-nums max-sm:flex-row max-sm:flex-wrap max-sm:justify-end max-sm:gap-x-2 max-sm:gap-y-0 max-sm:text-[10px] dark:text-zinc-400"
          role="status"
        >
          <span>
            Streak{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {stats.streak}
            </span>
          </span>
          {accuracy !== null ? (
            <span>
              Last {stats.history.length}:{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {accuracy}%
              </span>
            </span>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">
              No rounds yet
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="mb-1 text-center text-xs font-medium tracking-wide text-zinc-500 uppercase sm:mb-2 sm:text-sm dark:text-zinc-400">
          Weekday offset
        </p>
        <p className="mb-3 text-center text-[11px] leading-snug text-zinc-500 sm:mb-6 sm:text-xs sm:leading-relaxed dark:text-zinc-400">
          Read the line, then pick the weekday (1–20 days except 7 and 14;
          Sun–Sat week).
        </p>

        <div
          className="mb-4 min-h-[4.5rem] text-center sm:mb-8 sm:min-h-0"
          aria-live="polite"
        >
          {loading || !challenge ? (
            <span className="text-zinc-400">Loading…</span>
          ) : (
            <p
              className="font-mono text-xl font-medium tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
              aria-label={challengeAria || undefined}
            >
              {compactLine}
            </p>
          )}
        </div>

        {challenge && (
          <WeekdayPickerGrid
            shuffleKey={`${challenge.baseWeekday}-${challenge.days}-${challenge.direction}`}
            onPick={(value) => void handleGuess(value)}
            locked={loading || phase !== "guess" || submitting}
          />
        )}

        {result && phase === "revealed" && (
          <div
            className="mb-4 rounded-xl px-3 py-2 text-center text-xs sm:mb-6 sm:px-4 sm:py-3 sm:text-sm"
            role="status"
          >
            {result.correct ? (
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Correct.
              </p>
            ) : (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-red-700 dark:text-red-400">
                  Not quite.
                </span>{" "}
                It is{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {WEEKDAY_NAMES_SUN0[result.actualWeekday]} (
                  {weekdayShortLabel(result.actualWeekday)})
                </span>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 border-t border-zinc-100 pt-3 sm:pt-6 dark:border-zinc-800">
          {phase === "revealed" && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="min-h-[44px] w-full max-w-xs rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-6 sm:py-2.5 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 dark:focus-visible:ring-zinc-500"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
