"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatsCharts } from "@/components/StatsCharts";
import {
  accuracyForMode,
  createDefaultTrainerState,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  formatAnswerDuration,
  loadTrainerState,
  rollingMeanAnswerMs,
  rollingMeanAnswerMsAllRounds,
  saveTrainerState,
  TRAINER_STATS_KEY,
  type TrainerPersistedState,
  totalRoundsForDifficulty,
} from "@/lib/trainer-stats";

export type StatsDashboardProps = {
  syncedUserId?: string | null;
  initialRemoteState?: TrainerPersistedState | null;
};

export function StatsDashboard({
  syncedUserId = null,
  initialRemoteState = null,
}: StatsDashboardProps = {}) {
  const [state, setState] = useState<TrainerPersistedState>(() =>
    createDefaultTrainerState()
  );

  useEffect(() => {
    if (syncedUserId && initialRemoteState) {
      setState(initialRemoteState);
      saveTrainerState(initialRemoteState);
    } else {
      setState(loadTrainerState());
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === TRAINER_STATS_KEY) {
        setState(loadTrainerState());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncedUserId, initialRemoteState]);

  const grandTotal = state.rounds.length;
  const grandWins = state.rounds.filter((r) => r.won).length;
  const grandPct =
    grandTotal === 0 ? null : Math.round((grandWins / grandTotal) * 100);
  const grandAvgAnswerMs = rollingMeanAnswerMsAllRounds(state.rounds);

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <div>
        <Link
          href="/"
          className="mb-3 inline-flex min-h-[44px] items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:mb-4 sm:min-h-0 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Practice
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your stats
        </h1>
        <p className="mt-2 text-pretty text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          Streak and rolling accuracy are tracked separately for each
          difficulty. Answer time is measured only while the tab is visible and
          weekday choices are on screen (hidden tab or hidden choices pauses the
          clock). Very long rounds are not timed.
          {syncedUserId ? (
            <>
              {" "}
              While signed in, stats are saved to your Neon database and
              mirrored in the browser.
            </>
          ) : (
            <>
              {" "}
              Sign in to sync the same data to your account across devices.
            </>
          )}
        </p>
      </div>

      <StatsCharts state={state} />

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          By difficulty
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DIFFICULTY_ORDER.map((id) => {
            const mode = state.byDifficulty[id];
            const acc = accuracyForMode(mode);
            const played = totalRoundsForDifficulty(state.rounds, id);
            const avgMs = rollingMeanAnswerMs(state.rounds, id);
            return (
              <div
                key={id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {DIFFICULTY_LABELS[id]}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">Streak</dt>
                    <dd className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {mode.streak}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      {mode.history.length > 0
                        ? `Last ${mode.history.length}`
                        : "Rolling acc."}
                    </dt>
                    <dd className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {acc !== null ? `${acc}%` : "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      Avg. answer time (last 50 timed rounds)
                    </dt>
                    <dd className="font-mono text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {avgMs != null ? formatAnswerDuration(avgMs) : "—"}
                    </dd>
                  </div>
                  <div className="col-span-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      Rounds logged (all time)
                    </dt>
                    <dd className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {played}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          All difficulties combined
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {grandWins}
            </span>{" "}
            wins out of{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {grandTotal}
            </span>{" "}
            rounds logged
            {grandPct !== null && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {" "}
                ({grandPct}%)
              </span>
            )}
            .
            {grandAvgAnswerMs != null ? (
              <span className="mt-2 block text-zinc-600 dark:text-zinc-400">
                Mean answer time (last 50 timed rounds, all modes):{" "}
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatAnswerDuration(grandAvgAnswerMs)}
                </span>
              </span>
            ) : (
              <span className="mt-2 block text-zinc-500 dark:text-zinc-500">
                Answer times appear after you complete timed rounds on the
                practice page.
              </span>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
