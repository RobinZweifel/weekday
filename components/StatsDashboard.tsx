"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  accuracyForMode,
  createDefaultTrainerState,
  dailyAggregatesLastDays,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  loadTrainerState,
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

  const daily = dailyAggregatesLastDays(state.rounds, 30).slice().reverse();
  const grandTotal = state.rounds.length;
  const grandWins = state.rounds.filter((r) => r.won).length;
  const grandPct =
    grandTotal === 0 ? null : Math.round((grandWins / grandTotal) * 100);

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
          difficulty.
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

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          By difficulty
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DIFFICULTY_ORDER.map((id) => {
            const mode = state.byDifficulty[id];
            const acc = accuracyForMode(mode);
            const played = totalRoundsForDifficulty(state.rounds, id);
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
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Activity — last 30 days
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-500">
          Each bar is win rate for that calendar day (all difficulties).
        </p>
        <div className="space-y-2">
          {daily.map(({ dayKey, label, wins, total }) => {
            const pct = total === 0 ? 0 : Math.round((wins / total) * 100);
            return (
              <div
                key={dayKey}
                className="flex items-center gap-2 text-[11px] sm:gap-3 sm:text-xs"
              >
                <span className="w-[4.5rem] shrink-0 leading-tight text-zinc-500 tabular-nums sm:w-24 dark:text-zinc-400">
                  {label}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
                    style={{ width: `${total === 0 ? 0 : pct}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right tabular-nums text-zinc-600 sm:w-20 dark:text-zinc-300">
                  {total === 0 ? "—" : `${wins}/${total}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
