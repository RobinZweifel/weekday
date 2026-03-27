"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  accuracyForMode,
  dailyAggregatesLastDays,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  totalRoundsForDifficulty,
  type TrainerPersistedState,
} from "@/lib/trainer-stats";

function shortDayLabel(dayKey: string): string {
  const [, m, d] = dayKey.split("-").map(Number);
  if (!m || !d) return dayKey;
  return `${m}/${d}`;
}

const activityConfig = {
  wins: {
    label: "Wins",
    color: "var(--chart-1)",
  },
  losses: {
    label: "Losses",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const rateConfig = {
  rate: {
    label: "Win rate",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/** One key per difficulty so ChartStyle exposes `--color-{id}` for bar fills. */
const difficultyChartConfig = {
  very_easy: {
    label: DIFFICULTY_LABELS.very_easy,
    color: "var(--chart-1)",
  },
  easy: {
    label: DIFFICULTY_LABELS.easy,
    color: "var(--chart-2)",
  },
  medium: {
    label: DIFFICULTY_LABELS.medium,
    color: "var(--chart-3)",
  },
  hard: {
    label: DIFFICULTY_LABELS.hard,
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

type StatsChartsProps = {
  state: TrainerPersistedState;
};

export function StatsCharts({ state }: StatsChartsProps) {
  const daily = useMemo(
    () => dailyAggregatesLastDays(state.rounds, 30),
    [state.rounds]
  );

  const activityData = useMemo(
    () =>
      daily.map((d) => ({
        dayKey: d.dayKey,
        label: shortDayLabel(d.dayKey),
        wins: d.wins,
        losses: Math.max(0, d.total - d.wins),
        total: d.total,
      })),
    [daily]
  );

  const rateData = useMemo(
    () =>
      daily
        .filter((d) => d.total > 0)
        .map((d) => ({
          dayKey: d.dayKey,
          label: shortDayLabel(d.dayKey),
          rate: Math.round((d.wins / d.total) * 100),
        })),
    [daily]
  );

  const difficultyData = useMemo(
    () =>
      DIFFICULTY_ORDER.map((id) => ({
        id,
        name: DIFFICULTY_LABELS[id],
        rounds: totalRoundsForDifficulty(state.rounds, id),
        accuracy: accuracyForMode(state.byDifficulty[id]),
      })),
    [state.rounds, state.byDifficulty]
  );

  const hasRounds = state.rounds.length > 0;
  const anyDailyPlay = activityData.some((d) => d.total > 0);

  if (!hasRounds) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Progress
        </h2>
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-base">Charts</CardTitle>
            <CardDescription>
              Complete a few practice rounds to unlock activity and accuracy
              charts.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Progress
        </h2>
        <p className="text-xs text-muted-foreground">
          Last 30 calendar days (local time). Tooltips show exact counts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily rounds</CardTitle>
            <CardDescription>
              Wins vs losses stacked per day (all difficulties).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {!anyDailyPlay ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No plays in the last 30 days yet.
              </p>
            ) : (
              <ChartContainer
                config={activityConfig}
                className="aspect-auto h-[min(16rem,55vw)] w-full max-h-64 sm:h-64"
              >
                <BarChart
                  accessibilityLayer
                  data={activityData}
                  margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-chart-2/20"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    interval="preserveStartEnd"
                    minTickGap={24}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--chart-2)", opacity: 0.08 }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as
                            | { dayKey?: string }
                            | undefined;
                          return row?.dayKey ?? "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="losses"
                    stackId="stack"
                    fill="var(--color-losses)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="wins"
                    stackId="stack"
                    fill="var(--color-wins)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily win rate</CardTitle>
            <CardDescription>
              Percent of rounds won on days you played.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {rateData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No single-day samples yet.
              </p>
            ) : (
              <ChartContainer
                config={rateConfig}
                className="aspect-auto h-[min(16rem,55vw)] w-full max-h-64 sm:h-64"
              >
                <AreaChart
                  accessibilityLayer
                  data={rateData}
                  margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-rate)"
                        stopOpacity={0.55}
                      />
                      <stop
                        offset="55%"
                        stopColor="var(--color-rate)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-rate)"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-chart-2/20"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    interval="preserveStartEnd"
                    minTickGap={28}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    width={32}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="tabular-nums">{value}%</span>
                        )}
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as
                            | { dayKey?: string }
                            | undefined;
                          return row?.dayKey ?? "";
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-rate)"
                    strokeWidth={2.5}
                    fill="url(#fillRate)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Volume by difficulty</CardTitle>
          <CardDescription>
            Total logged rounds per mode (all time in this browser / synced
            state).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer
            config={difficultyChartConfig}
            className="aspect-auto h-[min(12rem,40vw)] w-full max-h-52 sm:h-48"
          >
            <BarChart
              accessibilityLayer
              data={difficultyData}
              layout="vertical"
              margin={{ left: 4, right: 16, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                className="stroke-chart-2/20"
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--chart-3)", opacity: 0.12 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const row = item?.payload as
                        | { accuracy: number | null }
                        | undefined;
                      const acc = row?.accuracy;
                      return (
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="tabular-nums font-medium">
                            {value} rounds
                          </span>
                          {acc != null ? (
                            <span className="text-muted-foreground">
                              Rolling {acc}% (last 20)
                            </span>
                          ) : null}
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="rounds" radius={[0, 6, 6, 0]}>
                {difficultyData.map((row) => (
                  <Cell
                    key={row.id}
                    fill={`var(--color-${row.id})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
