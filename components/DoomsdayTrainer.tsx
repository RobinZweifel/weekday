"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkDoomsdayAnswer,
  createDoomsdayChallenge,
  type DoomsdayChallenge,
} from "@/app/actions/doomsday-challenge";
import type { Difficulty } from "@/lib/weekday";

const WEEKDAYS_MON_FIRST: { label: string; value: number }[] = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "very_easy", label: "Very easy" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const STATS_KEY = "weekday-doomsday-drill-stats";
const HISTORY_LEN = 20;

type DrillStats = { streak: number; history: boolean[] };

function weekdayName(d: number): string {
  return WEEKDAYS_MON_FIRST.find((x) => x.value === d)?.label ?? "?";
}

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

export function DoomsdayTrainer() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [challenge, setChallenge] = useState<DoomsdayChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"guess" | "revealed">("guess");
  const [result, setResult] = useState<{
    correct: boolean;
    actualWeekday: number;
  } | null>(null);
  const [stats, setStats] = useState<DrillStats>({ streak: 0, history: [] });

  const fetchChallenge = useCallback(async (d: Difficulty) => {
    setLoading(true);
    setPhase("guess");
    setResult(null);
    try {
      const next = await createDoomsdayChallenge(d);
      setChallenge(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    void fetchChallenge(difficulty);
  }, [difficulty, fetchChallenge]);

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
        const r = await checkDoomsdayAnswer({
          year: challenge.year,
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
    void fetchChallenge(difficulty);
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
          Doomsday for year
        </p>
        <p className="mb-3 text-center text-[11px] leading-snug text-zinc-500 sm:mb-6 sm:text-xs sm:leading-relaxed dark:text-zinc-400">
          <span className="sm:hidden">
            Weekday of the last day in February (Gregorian).
          </span>
          <span className="hidden sm:inline">
            Which weekday is the last day of February? (That is the Doomsday for
            the Gregorian year.)
          </span>
        </p>

        <div
          className="mb-4 text-center font-mono text-2xl leading-tight tracking-tight text-zinc-900 tabular-nums sm:mb-8 sm:text-4xl md:text-5xl dark:text-zinc-50"
          aria-live="polite"
        >
          {loading || !challenge ? (
            <span className="text-zinc-400">Loading…</span>
          ) : (
            challenge.year
          )}
        </div>

        <div
          className="mb-4 flex max-w-full flex-wrap justify-center gap-1 sm:mb-6 sm:gap-2"
          role="group"
          aria-label="Pick weekday"
        >
          {WEEKDAYS_MON_FIRST.map(({ label, value }, i) => {
            const disabled =
              loading || !challenge || phase !== "guess" || submitting;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => void handleGuess(value)}
                className="min-h-[40px] min-w-[2.35rem] rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-1.5 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 sm:min-h-0 sm:min-w-[2.75rem] sm:px-3 sm:py-2.5 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500"
              >
                <span className="block leading-none">{label}</span>
                <span className="mt-0.5 hidden text-[10px] font-normal text-zinc-400 sm:block dark:text-zinc-500">
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>

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
                Doomsday was{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {weekdayName(result.actualWeekday)}
                </span>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 border-t border-zinc-100 pt-3 sm:gap-4 sm:pt-6 dark:border-zinc-800">
          <div className="flex max-w-full flex-wrap justify-center gap-1 sm:gap-2">
            {DIFFICULTY_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDifficulty(id)}
                className={`min-h-[34px] rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none active:opacity-90 sm:min-h-0 sm:px-4 sm:py-1.5 sm:text-sm dark:focus-visible:ring-zinc-500 ${
                  difficulty === id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {phase === "revealed" && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="min-h-[44px] w-full max-w-xs rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-6 sm:py-2.5 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 dark:focus-visible:ring-zinc-500"
            >
              Next year
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
