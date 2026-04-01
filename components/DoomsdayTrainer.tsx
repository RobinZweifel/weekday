"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  checkDoomsdayAnswer,
  createDoomsdayChallenge,
  type DoomsdayChallenge,
} from "@/app/actions/doomsday-challenge";
import { DoomsdayYearRangePanel } from "@/components/DoomsdayYearRangePanel";
import {
  DOOMSDAY_DEFAULT_RANGE,
  isValidDoomsdayChallengeRange,
  sortDoomsdayRange,
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
  /** Thumbs follow drag immediately (no refetch while moving). */
  const [sliderRange, setSliderRange] = useState<[number, number]>([
    DOOMSDAY_DEFAULT_RANGE[0],
    DOOMSDAY_DEFAULT_RANGE[1],
  ]);
  /** Committed range: new challenge only after pointer/keyboard commit. */
  const [activeRange, setActiveRange] = useState<[number, number]>([
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
  const challengeRequestId = useRef(0);

  useLayoutEffect(() => {
    const loaded = loadYearRangeFromStorage();
    setSliderRange(loaded);
    setActiveRange(loaded);
    setRangeReady(true);
  }, []);

  const fetchChallenge = useCallback(async (minY: number, maxY: number) => {
    const req = ++challengeRequestId.current;
    setLoading(true);
    setPhase("guess");
    setResult(null);
    try {
      const next = await createDoomsdayChallenge({
        minYear: minY,
        maxYear: maxY,
      });
      if (req !== challengeRequestId.current) return;
      setChallenge(next);
    } finally {
      if (req === challengeRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (!rangeReady) return;
    void fetchChallenge(activeRange[0], activeRange[1]);
  }, [activeRange, fetchChallenge, rangeReady]);

  useEffect(() => {
    if (!rangeReady) return;
    try {
      localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(activeRange));
    } catch {
      /* ignore */
    }
  }, [activeRange, rangeReady]);

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
    void fetchChallenge(activeRange[0], activeRange[1]);
  };

  const commitFullRange = useCallback((r: [number, number]) => {
    const t = sortDoomsdayRange(Math.round(r[0]), Math.round(r[1]));
    if (!isValidDoomsdayChallengeRange(t[0], t[1])) return;
    setSliderRange((prev) => {
      const a = Math.min(prev[0], prev[1]);
      const b = Math.max(prev[0], prev[1]);
      if (a === t[0] && b === t[1]) return prev;
      return t;
    });
    setActiveRange((prev) => {
      const a = Math.min(prev[0], prev[1]);
      const b = Math.max(prev[0], prev[1]);
      if (a === t[0] && b === t[1]) return prev;
      return t;
    });
  }, []);

  const [rangeSheetOpen, setRangeSheetOpen] = useState(false);

  useEffect(() => {
    if (!rangeSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRangeSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [rangeSheetOpen]);

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

  const rngLo = Math.min(sliderRange[0], sliderRange[1]);
  const rngHi = Math.max(sliderRange[0], sliderRange[1]);

  return (
    <div className="flex min-h-0 w-full max-w-xl min-w-0 flex-1 flex-col px-1 sm:flex-none sm:px-0">
      <div className="mb-2 hidden justify-end sm:mb-3 sm:flex">
        <div
          className="flex min-w-0 flex-col items-end gap-0.5 text-right text-xs text-zinc-500 tabular-nums dark:text-zinc-400"
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

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm sm:min-h-0 sm:flex-none sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-1 flex items-start justify-between gap-2 sm:mb-1 sm:block">
          <p className="flex-1 text-center text-[10px] font-medium tracking-wide text-zinc-500 uppercase sm:mb-1 sm:flex-none sm:text-xs sm:tracking-wide dark:text-zinc-400">
            <span className="sm:hidden">Doomsday · Feb last day</span>
            <span className="hidden sm:inline">Doomsday for year</span>
          </p>
          <div
            className="shrink-0 text-right text-[9px] leading-tight text-zinc-500 sm:hidden dark:text-zinc-400"
            role="status"
          >
            <div>
              <span className="text-zinc-400">Streak </span>
              <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                {stats.streak}
              </span>
            </div>
            {accuracy !== null ? (
              <div className="mt-0.5">
                <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {accuracy}%
                </span>
                <span className="text-zinc-400">
                  {" "}
                  ({stats.history.length})
                </span>
              </div>
            ) : (
              <div className="mt-0.5 text-zinc-400">No rounds yet</div>
            )}
          </div>
        </div>
        <p className="mb-1 hidden text-center text-[11px] leading-snug text-zinc-500 sm:mb-4 sm:block sm:text-xs sm:leading-relaxed dark:text-zinc-400">
          Which weekday is the last day of February? (That is the Doomsday for
          the Gregorian year.)
        </p>
        <p className="mb-2 hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center sm:mb-6 sm:flex">
          <Link
            href="/learn/doomsday-year"
            className="text-[11px] font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline sm:text-xs dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Quick guide: find any year’s Doomsday
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
            ·
          </span>
          <Link
            href="/doomsday/help"
            className="text-[11px] font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline sm:text-xs dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Cheat sheet: anchors & key years
          </Link>
        </p>

        <div
          className="mb-2 text-center font-mono text-2xl leading-none tracking-tight text-zinc-900 tabular-nums sm:mb-8 sm:text-4xl sm:leading-tight md:text-5xl dark:text-zinc-50"
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
            density="compactMobile"
            shuffleKey={String(challenge.year)}
            onPick={(value) => void handleGuess(value)}
            locked={loading || phase !== "guess" || submitting}
          />
        )}

        {result && phase === "revealed" && (
          <div
            className="mb-2 rounded-lg px-2 py-1.5 text-center text-[11px] sm:mb-6 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
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

        <div className="mt-auto flex flex-col items-center gap-2 border-t border-zinc-100 pt-2 sm:mt-0 sm:gap-4 sm:pt-6 dark:border-zinc-800">
          <div className="w-full min-w-0 sm:px-1">
            {/* Mobile: one row trigger — full editor in bottom sheet */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setRangeSheetOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-2 text-left dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Year range
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {rngLo}–{rngHi}
                </span>
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                  Edit
                </span>
              </button>
            </div>
            <div className="hidden sm:block">
              <DoomsdayYearRangePanel
                sliderRange={sliderRange}
                onSliderPreview={setSliderRange}
                onCommit={commitFullRange}
              />
            </div>
          </div>

          {phase === "revealed" && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="min-h-11 w-full max-w-xs rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-50 sm:min-h-0 sm:w-auto sm:px-6 sm:py-2.5 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 dark:focus-visible:ring-zinc-500"
            >
              Next year
            </button>
          )}
        </div>
      </div>

      {/* Mobile range sheet — avoids long page scroll */}
      {rangeSheetOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doomsday-range-sheet-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Close range editor"
            onClick={() => setRangeSheetOpen(false)}
          />
          <div className="relative z-10 flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full flex-col rounded-t-2xl border border-b-0 border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="flex shrink-0 flex-col items-center border-b border-zinc-100 pt-2 pb-1 dark:border-zinc-800">
              <div className="mb-2 h-1 w-9 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <h2
                id="doomsday-range-sheet-title"
                className="px-4 pb-2 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Adjust year range
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1">
              <DoomsdayYearRangePanel
                density="compact"
                sliderRange={sliderRange}
                onSliderPreview={setSliderRange}
                onCommit={commitFullRange}
              />
            </div>
            <div
              className="shrink-0 border-t border-zinc-100 p-3 dark:border-zinc-800"
              style={{
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
              }}
            >
              <button
                type="button"
                onClick={() => setRangeSheetOpen(false)}
                className="min-h-11 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
