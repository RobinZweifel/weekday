"use client";

import { useCallback, useEffect, useState } from "react";

/** Matches `Date.prototype.getUTCDay()` and this app: Sun = 0 … Sat = 6. */
const UTC_WEEKDAYS: readonly { value: number; full: string; short: string }[] =
  [
    { value: 0, full: "Sunday", short: "Sun" },
    { value: 1, full: "Monday", short: "Mon" },
    { value: 2, full: "Tuesday", short: "Tue" },
    { value: 3, full: "Wednesday", short: "Wed" },
    { value: 4, full: "Thursday", short: "Thu" },
    { value: 5, full: "Friday", short: "Fri" },
    { value: 6, full: "Saturday", short: "Sat" },
  ];

function randomValue(): number {
  return Math.floor(Math.random() * 7);
}

type QuizMode = "name-to-num" | "num-to-name";

export function WeekdayNumberTrainer() {
  const [mode, setMode] = useState<QuizMode>("name-to-num");
  const [target, setTarget] = useState(randomValue);
  const [phase, setPhase] = useState<"ask" | "revealed">("ask");
  const [lastPick, setLastPick] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const nextChallenge = useCallback(() => {
    setTarget(randomValue());
    setPhase("ask");
    setLastPick(null);
  }, []);

  const correct = lastPick !== null && lastPick === target;

  const pickNumber = (n: number) => {
    if (phase !== "ask") return;
    setLastPick(n);
    setPhase("revealed");
    setStreak((s) => (n === target ? s + 1 : 0));
  };

  const pickName = (value: number) => {
    pickNumber(value);
  };

  useEffect(() => {
    if (phase !== "ask" || mode !== "name-to-num") return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const k = e.key;
      if (k >= "0" && k <= "6") {
        e.preventDefault();
        const n = Number(k);
        setLastPick(n);
        setPhase("revealed");
        setStreak((s) => (n === target ? s + 1 : 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, target, mode]);

  const targetDay = UTC_WEEKDAYS[target]!;

  return (
    <section
      id="weekday-numbers"
      className="scroll-mt-20 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
    >
      <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Weekday numbers (this app)
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Same as JavaScript{" "}
        <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
          getUTCDay()
        </code>
        : <strong className="font-medium text-zinc-800 dark:text-zinc-200">Sunday = 0</strong>{" "}
        through <strong className="font-medium text-zinc-800 dark:text-zinc-200">Saturday = 6</strong>
        . The main trainer and stats use these values.
      </p>

      <div className="mb-5 grid grid-cols-7 gap-1 text-center sm:gap-2">
        {UTC_WEEKDAYS.map((d) => (
          <div
            key={d.value}
            className="rounded-lg border border-zinc-200/90 bg-zinc-50 px-0.5 py-2 dark:border-zinc-700 dark:bg-zinc-900/60"
          >
            <div className="text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
              {d.short}
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums text-zinc-900 sm:text-base dark:text-zinc-50">
              {d.value}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Quick drill
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Mode</span>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as QuizMode);
                setTarget(randomValue());
                setPhase("ask");
                setLastPick(null);
              }}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="Quiz mode"
            >
              <option value="name-to-num">Name → number</option>
              <option value="num-to-name">Number → name</option>
            </select>
          </div>
        </div>

        <p className="mb-1 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          Streak <span className="font-semibold text-zinc-800 dark:text-zinc-200">{streak}</span>
        </p>

        {mode === "name-to-num" ? (
          <p className="mb-3 text-center text-sm text-zinc-700 dark:text-zinc-300">
            What number is{" "}
            <strong className="text-base text-zinc-900 dark:text-zinc-50">
              {targetDay.full}
            </strong>
            ?
          </p>
        ) : (
          <p className="mb-3 text-center text-sm text-zinc-700 dark:text-zinc-300">
            Which day is number{" "}
            <strong className="font-mono text-lg tabular-nums text-zinc-900 dark:text-zinc-50">
              {target}
            </strong>
            ?
          </p>
        )}

        {mode === "name-to-num" ? (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {UTC_WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                disabled={phase === "revealed"}
                onClick={() => pickNumber(d.value)}
                className="min-h-11 rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-sm font-semibold tabular-nums text-zinc-900 transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                aria-label={`Answer ${d.value}`}
              >
                {d.value}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {UTC_WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                disabled={phase === "revealed"}
                onClick={() => pickName(d.value)}
                className="min-h-11 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
              >
                {d.full}
              </button>
            ))}
          </div>
        )}

        {phase === "revealed" && lastPick !== null ? (
          <div className="mt-3 space-y-2 text-center text-sm" role="status">
            {correct ? (
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Correct.
              </p>
            ) : (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-red-700 dark:text-red-400">
                  Not quite.
                </span>{" "}
                {mode === "name-to-num" ? (
                  <>
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {targetDay.full}
                    </span>{" "}
                    is{" "}
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {target}
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Number{" "}
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {target}
                    </span>{" "}
                    is{" "}
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {targetDay.full}
                    </span>
                    .
                  </>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={nextChallenge}
              className="min-h-10 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Next
            </button>
          </div>
        ) : (
          <p className="mt-2 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
            Tip: keys <kbd className="rounded border border-zinc-300 px-0.5 font-mono dark:border-zinc-600">0</kbd>
            –
            <kbd className="rounded border border-zinc-300 px-0.5 font-mono dark:border-zinc-600">6</kbd>{" "}
            choose a number in name → number mode.
          </p>
        )}
      </div>
    </section>
  );
}
