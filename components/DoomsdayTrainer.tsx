"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  checkDoomsdayAnswer,
  createDoomsdayChallenge,
  type DoomsdayChallenge,
} from "@/app/actions/doomsday-challenge";
import { Slider } from "@/components/ui/slider";
import {
  DOOMSDAY_DEFAULT_RANGE,
  DOOMSDAY_SLIDER_MAX,
  DOOMSDAY_SLIDER_MIN,
  isValidDoomsdayChallengeRange,
} from "@/lib/doomsday";
import { WEEKDAYS_MON_FIRST, weekdayShortLabel } from "@/lib/weekday-buttons";
import { WeekdayPickerGrid } from "@/components/WeekdayPickerGrid";

const RANGE_STORAGE_KEY = "weekday-doomsday-year-range";

const STATS_KEY = "weekday-doomsday-drill-stats";
const HISTORY_LEN = 20;

type DrillStats = { streak: number; history: boolean[] };

function loadYearRangeFromStorage(): [number, number] {
  if (typeof window === "undefined") {
    return [DOOMSDAY_DEFAULT_RANGE[0], DOOMSDAY_DEFAULT_RANGE[1]];
  }
  try {
    const raw = localStorage.getItem(RANGE_STORAGE_KEY);
    if (!raw) {
      return [DOOMSDAY_DEFAULT_RANGE[0], DOOMSDAY_DEFAULT_RANGE[1]];
    }
    const p = JSON.parse(raw) as unknown;
    if (Array.isArray(p) && p.length === 2) {
      const a = Math.round(Number(p[0]));
      const b = Math.round(Number(p[1]));
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (isValidDoomsdayChallengeRange(lo, hi)) {
        return [lo, hi];
      }
    }
  } catch {
    /* ignore */
  }
  return [DOOMSDAY_DEFAULT_RANGE[0], DOOMSDAY_DEFAULT_RANGE[1]];
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
  const [yearRange, setYearRange] = useState<[number, number]>([
    DOOMSDAY_DEFAULT_RANGE[0],
    DOOMSDAY_DEFAULT_RANGE[1],
  ]);
  const [rangeReady, setRangeReady] = useState(false);
  const [challenge, setChallenge] = useState<DoomsdayChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"guess" | "revealed">("guess");
  const [result, setResult] = useState<{
    correct: boolean;
    actualWeekday: number;
  } | null>(null);
  const [stats, setStats] = useState<DrillStats>({ streak: 0, history: [] });

  useLayoutEffect(() => {
    setYearRange(loadYearRangeFromStorage());
    setRangeReady(true);
  }, []);

  const fetchChallenge = useCallback(async (minY: number, maxY: number) => {
    setLoading(true);
    setPhase("guess");
    setResult(null);
    try {
      const next = await createDoomsdayChallenge({
        minYear: minY,
        maxYear: maxY,
      });
      setChallenge(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (!rangeReady) return;
    void fetchChallenge(yearRange[0], yearRange[1]);
  }, [yearRange, fetchChallenge, rangeReady]);

  useEffect(() => {
    if (!rangeReady) return;
    try {
      localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(yearRange));
    } catch {
      /* ignore */
    }
  }, [yearRange, rangeReady]);

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
    void fetchChallenge(yearRange[0], yearRange[1]);
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
        <p className="mb-2 text-center text-[11px] leading-snug text-zinc-500 sm:mb-4 sm:text-xs sm:leading-relaxed dark:text-zinc-400">
          <span className="sm:hidden">
            Weekday of the last day in February (Gregorian).
          </span>
          <span className="hidden sm:inline">
            Which weekday is the last day of February? (That is the Doomsday for
            the Gregorian year.)
          </span>
        </p>
        <p className="mb-3 text-center sm:mb-6">
          <Link
            href="/learn/doomsday-year"
            className="text-[11px] font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline sm:text-xs dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Quick guide: find any year’s Doomsday
          </Link>
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

        {challenge && (
          <WeekdayPickerGrid
            shuffleKey={String(challenge.year)}
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
                Doomsday was{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {weekdayShortLabel(result.actualWeekday)}
                </span>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-zinc-100 pt-3 sm:gap-4 sm:pt-6 dark:border-zinc-800">
          <div className="w-full min-w-0 px-1">
            <p className="mb-2 text-center text-[11px] font-medium text-zinc-600 sm:text-xs dark:text-zinc-300">
              Year range{" "}
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {yearRange[0]}–{yearRange[1]}
              </span>
            </p>
            <p className="mb-3 text-center text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">
              Drag either end ({DOOMSDAY_SLIDER_MIN}–{DOOMSDAY_SLIDER_MAX}). A
              new year is drawn when the range changes.
            </p>
            <Slider
              className="w-full py-2 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:after:-inset-3 sm:[&_[data-slot=slider-thumb]]:size-3 sm:[&_[data-slot=slider-thumb]]:after:-inset-2"
              min={DOOMSDAY_SLIDER_MIN}
              max={DOOMSDAY_SLIDER_MAX}
              step={1}
              minStepsBetweenValues={0}
              value={yearRange}
              onValueChange={(v) => {
                if (Array.isArray(v) && v.length === 2) {
                  const a = Math.round(v[0]!);
                  const b = Math.round(v[1]!);
                  if (isValidDoomsdayChallengeRange(a, b)) {
                    setYearRange([a, b]);
                  }
                }
              }}
              aria-label="Gregorian year range for practice"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400 tabular-nums dark:text-zinc-500">
              <span>{DOOMSDAY_SLIDER_MIN}</span>
              <span>{DOOMSDAY_SLIDER_MAX}</span>
            </div>
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
