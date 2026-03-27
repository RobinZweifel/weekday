"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upsertTrainerStats } from "@/app/actions/trainer-sync";
import {
  checkAnswer,
  createChallenge,
  type ChallengeDate,
} from "@/app/actions/challenge";
import type { Difficulty } from "@/lib/weekday";
import {
  accuracyForMode,
  applyRoundResult,
  createDefaultTrainerState,
  DIFFICULTY_LABELS,
  loadTrainerState,
  saveTrainerState,
  type TrainerPersistedState,
} from "@/lib/trainer-stats";

export type WeekdayTrainerProps = {
  syncedUserId?: string | null;
  initialRemoteState?: TrainerPersistedState | null;
};
import { SettingsToggle } from "@/components/SettingsToggle";

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

/** How long date + weekday row stay visible before hiding (memory mode). */
const MEMORIZE_MS = 5000;
/** How long a “Peek date” stays on screen. */
const PEEK_MS = 3000;

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

export function WeekdayTrainer({
  syncedUserId = null,
  initialRemoteState = null,
}: WeekdayTrainerProps = {}) {
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

  const [memoryMode, setMemoryMode] = useState(true);
  const [surfaceMemorizeVisible, setSurfaceMemorizeVisible] = useState(true);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [peekDate, setPeekDate] = useState(false);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteBootstrapDone = useRef(false);

  const fetchChallenge = useCallback(async (d: Difficulty) => {
    setLoading(true);
    setPhase("guess");
    setResult(null);
    setWrongWeekdays([]);
    setAnswerOpen(false);
    setPeekDate(false);
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
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
    if (!syncedUserId) {
      remoteBootstrapDone.current = false;
      return;
    }
    if (remoteBootstrapDone.current) return;
    remoteBootstrapDone.current = true;
    if (initialRemoteState) {
      setTrainerState(initialRemoteState);
      saveTrainerState(initialRemoteState);
      return;
    }
    void upsertTrainerStats(loadTrainerState());
  }, [syncedUserId, initialRemoteState]);

  useEffect(() => {
    if (!syncedUserId) return;
    const id = window.setTimeout(() => {
      void upsertTrainerStats(trainerState);
    }, 900);
    return () => window.clearTimeout(id);
  }, [trainerState, syncedUserId]);

  useEffect(() => {
    void fetchChallenge(difficulty);
  }, [difficulty, fetchChallenge]);

  useEffect(() => {
    if (wrongWeekdays.length > 0) setAnswerOpen(true);
  }, [wrongWeekdays.length]);

  useEffect(() => {
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!memoryMode) {
      setSurfaceMemorizeVisible(true);
      setAnswerOpen(true);
      return;
    }
    if (!challenge || loading || phase !== "guess") return;
    setSurfaceMemorizeVisible(true);
    setAnswerOpen(false);
    const id = setTimeout(() => setSurfaceMemorizeVisible(false), MEMORIZE_MS);
    return () => clearTimeout(id);
  }, [memoryMode, challenge, loading, phase]);

  const handlePeekDate = useCallback(() => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    setPeekDate(true);
    peekTimerRef.current = setTimeout(() => {
      setPeekDate(false);
      peekTimerRef.current = null;
    }, PEEK_MS);
  }, []);

  const inRecall =
    memoryMode &&
    phase === "guess" &&
    !loading &&
    !!challenge &&
    !surfaceMemorizeVisible;

  const showDateInCard =
    loading ||
    !challenge ||
    phase === "revealed" ||
    !memoryMode ||
    surfaceMemorizeVisible ||
    peekDate;

  const showWeekdayButtons =
    !memoryMode ||
    phase === "revealed"
      ? false
      : surfaceMemorizeVisible || answerOpen;

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

  useEffect(() => {
    if (phase !== "guess" || loading || !showWeekdayButtons) return;
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
  }, [phase, loading, handleGuess, wrongWeekdays, showWeekdayButtons]);

  return (
    <div className="w-full max-w-lg min-w-0 px-1 sm:px-0">
      <div className="mb-2 flex justify-end sm:mb-3">
        <div
          className="flex min-w-0 flex-col items-end gap-0.5 text-right text-xs text-zinc-500 tabular-nums max-sm:flex-row max-sm:flex-wrap max-sm:justify-end max-sm:gap-x-2 max-sm:gap-y-0 max-sm:text-[10px] dark:text-zinc-400"
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
          {syncedUserId ? (
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              Cloud sync on
            </span>
          ) : null}
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

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="mb-2 text-center text-xs font-medium tracking-wide text-zinc-500 uppercase sm:mb-6 sm:text-sm dark:text-zinc-400">
          What day of the week?
        </p>

        {inRecall && (
          <p className="mb-2 text-center text-[11px] leading-snug text-zinc-600 sm:mb-4 sm:text-sm dark:text-zinc-400">
            <span className="sm:hidden">Peek for the date or Answer to pick.</span>
            <span className="hidden sm:inline">
              Date and choices are hidden. Peek if you need the date again, or
              Answer when you are ready to pick.
            </span>
          </p>
        )}

        <div
          className="mb-4 text-center font-mono text-lg leading-snug tracking-tight text-zinc-900 tabular-nums sm:mb-8 sm:text-3xl sm:leading-tight md:text-4xl dark:text-zinc-50"
          aria-live="polite"
        >
          {loading || !challenge ? (
            <span className="text-zinc-400">Loading…</span>
          ) : showDateInCard ? (
            formatChallengeDate(
              challenge.year,
              challenge.month,
              challenge.day
            )
          ) : (
            <span className="font-sans text-base font-normal tracking-normal text-zinc-400 sm:text-xl dark:text-zinc-500">
              Date hidden
            </span>
          )}
        </div>

        {inRecall && (
          <div className="mb-4 flex flex-row flex-wrap items-center justify-center gap-2 sm:mb-6 sm:gap-2">
            <button
              type="button"
              onClick={handlePeekDate}
              className="min-h-[40px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500"
            >
              Peek date
            </button>
            <button
              type="button"
              onClick={() => setAnswerOpen(true)}
              className="min-h-[40px] rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300 dark:focus-visible:ring-zinc-500"
            >
              Answer
            </button>
            {answerOpen && wrongWeekdays.length === 0 && (
              <button
                type="button"
                onClick={() => setAnswerOpen(false)}
                className="min-h-[40px] rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 active:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500"
              >
                Hide choices
              </button>
            )}
          </div>
        )}

        {memoryMode &&
          phase === "guess" &&
          !loading &&
          challenge &&
          surfaceMemorizeVisible && (
            <p className="mb-2 text-center text-[11px] text-zinc-400 sm:mb-4 sm:text-xs dark:text-zinc-500">
              Memorize now — hiding in a few seconds.
            </p>
          )}

        {wrongWeekdays.length > 0 && phase === "guess" && (
          <p
            className="mb-2 text-center text-xs font-medium text-amber-800 sm:mb-4 sm:text-sm dark:text-amber-200"
            role="status"
          >
            Not that one — one more try.
          </p>
        )}

        {showWeekdayButtons && (
          <div
            className="mb-4 flex max-w-full flex-wrap justify-center gap-1 sm:mb-6 sm:gap-2"
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
        )}

        {result && phase === "revealed" && (
          <div
            className="mb-4 rounded-xl px-3 py-2 text-center text-xs sm:mb-6 sm:px-4 sm:py-3 sm:text-sm"
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

        <div className="flex flex-col items-center gap-2 border-t border-zinc-100 pt-3 sm:gap-5 sm:pt-6 dark:border-zinc-800">
          <div className="w-full min-w-0 divide-y divide-zinc-200/90 rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-1.5 sm:px-3 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/35">
            <SettingsToggle
              id="toggle-memory-mode"
              checked={memoryMode}
              onCheckedChange={setMemoryMode}
              label="Memory mode"
              description={`Hide the date and weekday row after ${MEMORIZE_MS / 1000} seconds. Use Peek or Answer when you are ready.`}
            />
            <SettingsToggle
              id="toggle-second-chance"
              checked={secondChanceEnabled}
              onCheckedChange={setSecondChanceEnabled}
              label="Second chance"
              description="If your first guess is wrong, you get one more try before the round ends."
            />
          </div>

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
              Next date
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
