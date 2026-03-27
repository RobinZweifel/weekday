import Link from "next/link";
import { getDoomsdayWeekday } from "@/lib/doomsday";
import { weekdayShortLabel } from "@/lib/weekday-buttons";

export const metadata = {
  title: "Doomsday cheat sheet — Weekday trainer",
  description:
    "Quick-reference tables: anchor dates, century anchors, and sample years for the Doomsday drill.",
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const ANCHOR_ROWS = [
  {
    rule: "Even months / same day",
    dates: "4/4, 6/6, 8/8, 10/10, 12/12",
  },
  {
    rule: "“Work 9 to 5 at 7‑11”",
    dates: "5/9, 9/5, 7/11, 11/7",
  },
  {
    rule: "Pi day",
    dates: "3/14",
  },
  {
    rule: "US Independence Day",
    dates: "7/4",
  },
  {
    rule: "January",
    dates: "3rd (leap years) or 4th — same weekday as last February",
  },
  {
    rule: "February",
    dates: "Last day (28 or 29) — this is the year’s Doomsday",
  },
] as const;

const CENTURY_ROWS = [
  { centuries: "…16xx, …20xx", weekday: "Tuesday", value: 2 as const },
  { centuries: "…17xx, …21xx", weekday: "Sunday", value: 0 as const },
  { centuries: "…18xx, …22xx", weekday: "Friday", value: 5 as const },
  { centuries: "…19xx, …23xx", weekday: "Wednesday", value: 3 as const },
] as const;

const KEY_YEAR_NOTES = [
  { year: 1600, note: "Gregorian leap century" },
  { year: 1700, note: "Non-leap century boundary" },
  { year: 1800, note: "Non-leap century boundary" },
  { year: 1900, note: "Non-leap century boundary" },
  { year: 2000, note: "Gregorian leap century" },
  { year: 2020, note: "Round decade" },
  { year: 2024, note: "Recent leap year" },
  { year: 2025, note: "Handy “near now” check" },
  { year: 1776, note: "US independence" },
  { year: 1969, note: "First crewed Moon landing" },
  { year: 1987, note: "Worked example in the year guide" },
] as const;

export default function DoomsdayHelpPage() {
  const keyYearRows = KEY_YEAR_NOTES.map(({ year, note }) => {
    const wd = getDoomsdayWeekday(year);
    return {
      year,
      note,
      short: weekdayShortLabel(wd),
      full: WEEKDAY_NAMES[wd] ?? "?",
      value: wd,
    };
  });

  return (
    <div className="mx-auto max-w-2xl min-w-0 px-3 py-8 sm:px-4 sm:py-12">
      <div className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
        <Link
          href="/doomsday"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Year drill
        </Link>
        <Link
          href="/learn/doomsday-year"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Step-by-step: any year →
        </Link>
        <Link
          href="/learn"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Full Doomsday method →
        </Link>
      </div>

      <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Doomsday cheat sheet
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Compact rules and tables for the{" "}
        <Link
          href="/doomsday"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          year drill
        </Link>
        . Weekdays match the app:{" "}
        <span className="whitespace-nowrap">0 = Sun … 6 = Sat.</span>
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Rules (year → weekday)
        </h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <li>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">
              Century anchor.
            </strong>{" "}
            Let{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              C = ⌊year / 100⌋
            </code>
            . Then{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              anchor = (5 × (C mod 4) + 2) mod 7
            </code>
            , or read the century table below.
          </li>
          <li>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">
              Last two digits.
            </strong>{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              y = year mod 100
            </code>
            ;{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              a = ⌊y/12⌋
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              b = y mod 12
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              c = ⌊b/4⌋
            </code>
            .
          </li>
          <li>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">
              Doomsday weekday.
            </strong>{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-900">
              (anchor + a + b + c) mod 7
            </code>
            . That is the weekday of the last day in February for that year.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Dates on Doomsday (mnemonics)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Rule
                </th>
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Dates
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {ANCHOR_ROWS.map((row) => (
                <tr key={row.rule}>
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                    {row.rule}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-800 tabular-nums sm:text-sm dark:text-zinc-200">
                    {row.dates}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Century anchor (Gregorian)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Century prefix
                </th>
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Anchor weekday
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-zinc-900 sm:table-cell dark:text-zinc-50">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {CENTURY_ROWS.map((row) => (
                <tr key={row.centuries}>
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                    {row.centuries}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
                    {row.weekday}
                  </td>
                  <td className="hidden px-4 py-2.5 font-mono tabular-nums text-zinc-600 sm:table-cell dark:text-zinc-400">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Reference years (Doomsday)
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Use these to sanity-check your mental math. Values are computed for the
          Gregorian calendar (same as the drill).
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Year
                </th>
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Weekday
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-zinc-900 sm:table-cell dark:text-zinc-50">
                  #
                </th>
                <th className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-50">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {keyYearRows.map((row) => (
                <tr key={row.year}>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {row.year}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {row.full}
                    </span>
                    <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                      ({row.short})
                    </span>
                  </td>
                  <td className="hidden px-4 py-2.5 font-mono tabular-nums text-zinc-600 sm:table-cell dark:text-zinc-400">
                    {row.value}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        More detail:{" "}
        <Link
          href="/learn/doomsday-year"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Find any year’s Doomsday
        </Link>
        ,{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          monthly anchors
        </Link>
        , or{" "}
        <a
          href="https://en.wikipedia.org/wiki/Doomsday_rule"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikipedia
        </a>
        .
      </p>
    </div>
  );
}
