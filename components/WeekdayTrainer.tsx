"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkAnswer,
  createChallenge,
  type ChallengeDate,
} from "@/app/actions/challenge";
import type { Difficulty } from "@/lib/weekday";
import {
  accuracyForMode,
  applyRoundResult,
  clearTrainerState,
  createDefaultTrainerState,
  DIFFICULTY_LABELS,
  loadTrainerState,
  saveTrainerState,
  type TrainerPersistedState,
} from "@/lib/trainer-stats";

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

function weekdayName(d: number): string {
  return WEEKDAYS_MON_FIRST.find((x) => x.value === d)?.label ?? "?";
}

function formatChallengeDate(y: number, m: number, d: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function WeekdayTrainer() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [challenge, setChallenge] = useState<ChallengeDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"guess" | "revealed">("guess");
  const [secondChanceEnabled, setSecondChanceEnabled] = useState(false);
  const [wrongWeekdays, setWrongWeekdays] = useState<number[]>([]);
  const [result, setResult] = useState<{
    correct: boolean;
    actualWeekday: number;
    secondTry?: boolean;
  } | null>(null);
  const [trainerState, setTrainerState] = useState<TrainerPersistedState>(() =>
    createDefaultTrainerState()
  );

  const fetchChallenge = useCallback(async (d: Difficulty) => {
    setLoading(true);
    setPhase("guess");
    setResult(null);
    setWrongWeekdays([]);
    try {
      const next = await createChallenge(d);
      setChallenge(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTrainerState(loadTrainerState());
  }, []);

  useEffect(() => {
    void fetchChallenge(difficulty);
  }, [difficulty, fetchChallenge]);

  const modeStats = trainerState.byDifficulty[difficulty];
  const accuracy = accuracyForMode(modeStats);

  const handleGuess = useCallback(
    async (weekday: number) => {
      if (!challenge || phase !== "guess" || submitting) return;
      if (wrongWeekdays.includes(weekday)) return;
      setSubmitting(true);
      try {
        const r = await checkAnswer({
          year: challenge.year,
          month: challenge.month,
          day: challenge.day,
          weekday,
        });
        if (r.correct) {
          const secondTry = wrongWeekdays.length > 0;
          setResult({
            correct: true,
            actualWeekday: r.actualWeekday,
            secondTry,
          });
          setPhase("revealed");
          setTrainerState((prev) => {
            const next = applyRoundResult(prev, difficulty, true);
            saveTrainerState(next);
            return next;
          });
          return;
        }
        if (secondChanceEnabled && wrongWeekdays.length === 0) {
          setWrongWeekdays([weekday]);
          return;
        }
        setResult({
          correct: false,
          actualWeekday: r.actualWeekday,
        });
        setPhase("revealed");
        setTrainerState((prev) => {
          const next = applyRoundResult(prev, difficulty, false);
          saveTrainerState(next);
          return next;
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      challenge,
      phase,
      submitting,
      secondChanceEnabled,
      wrongWeekdays,
      difficulty,
    ]
  );

  const handleNext = () => {
    void fetchChallenge(difficulty);
  };

  const handleResetStats = useCallback(() => {
    clearTrainerState();
    setTrainerState(createDefaultTrainerState());
  }, []);

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
      if (wd === undefined || wrongWeekdays.includes(wd)) return;
      void handleGuess(wd);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, loading, handleGuess, wrongWeekdays]);

  return (
    <div className="w-full max-w-lg">
      <div className="mb-3 flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={handleResetStats}
          className="shrink-0 pt-0.5 text-left text-xs text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500"
        >
          Reset stats
        </button>
        <div
          className="flex min-w-0 flex-col items-end gap-0.5 text-right text-xs text-zinc-500 tabular-nums dark:text-zinc-400"
          role="status"
          aria-label={
            accuracy !== null
              ? `${DIFFICULTY_LABELS[difficulty]}: streak ${modeStats.streak}. Accuracy over last ${modeStats.history.length} answers: ${accuracy} percent.`
              : `${DIFFICULTY_LABELS[difficulty]}: streak ${modeStats.streak}.`
          }
        >
          <span className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
          <span>
            Streak{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {modeStats.streak}
            </span>
          </span>
          {accuracy !== null ? (
            <span>
              Last {modeStats.history.length}:{" "}
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

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="mb-6 text-center text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          What day of the week?
        </p>

        <div
          className="mb-8 text-center font-mono text-3xl leading-tight tracking-tight text-zinc-900 tabular-nums sm:text-4xl dark:text-zinc-50"
          aria-live="polite"
        >
          {loading || !challenge ? (
            <span className="text-zinc-400">Loading…</span>
          ) : (
            formatChallengeDate(
              challenge.year,
              challenge.month,
              challenge.day
            )
          )}
        </div>

        {wrongWeekdays.length > 0 && phase === "guess" && (
          <p
            className="mb-4 text-center text-sm font-medium text-amber-800 dark:text-amber-200"
            role="status"
          >
            Not that one — one more try.
          </p>
        )}

        <div
          className="mb-6 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Pick weekday"
        >
          {WEEKDAYS_MON_FIRST.map(({ label, value }, i) => {
            const pickedWrong = wrongWeekdays.includes(value);
            const disabled =
              loading ||
              !challenge ||
              phase !== "guess" ||
              submitting ||
              pickedWrong;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => void handleGuess(value)}
                className="min-w-[3.25rem] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500"
              >
                <span className="block">{label}</span>
                <span className="mt-0.5 block text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>

        {result && phase === "revealed" && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-center text-sm"
            role="status"
          >
            {result.correct ? (
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                {result.secondTry
                  ? "Correct on your second try."
                  : "Correct."}
              </p>
            ) : (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-red-700 dark:text-red-400">
                  Not quite.
                </span>{" "}
                It was{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {weekdayName(result.actualWeekday)}
                </span>
                .
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={secondChanceEnabled}
              onChange={(e) => setSecondChanceEnabled(e.target.checked)}
              className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:ring-zinc-500"
            />
            <span>Second chance (one retry if the first guess is wrong)</span>
          </label>

          <div className="flex flex-wrap justify-center gap-2">
            {DIFFICULTY_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDifficulty(id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none dark:focus-visible:ring-zinc-500 ${
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
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-500"
            >
              Next date
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
