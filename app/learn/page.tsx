import Link from "next/link";
import { getUtcWeekday, lastFebruaryDay } from "@/lib/weekday";

const MONTH_ANCHORS = [
  { month: "January", note: "3rd in leap years, 4th otherwise (same weekday as last Feb)" },
  { month: "February", note: "last day (28 or 29) is Doomsday" },
  { month: "March", note: "7th (\"0 March\")" },
  { month: "April", note: "4th" },
  { month: "May", note: "9th" },
  { month: "June", note: "6th" },
  { month: "July", note: "11th" },
  { month: "August", note: "8th" },
  { month: "September", note: "5th" },
  { month: "October", note: "10th" },
  { month: "November", note: "7th" },
  { month: "December", note: "12th" },
] as const;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default function LearnPage() {
  const year = new Date().getUTCFullYear();
  const febLast = lastFebruaryDay(year);
  const doomsdayWeekday = getUtcWeekday(year, 2, febLast);
  const doomsdayName = WEEKDAY_NAMES[doomsdayWeekday];

  return (
    <div className="mx-auto max-w-2xl min-w-0 px-3 py-10 sm:px-4 sm:py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to practice
        </Link>
        <Link
          href="/doomsday"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Doomsday-by-year drill →
        </Link>
        <Link
          href="/learn/doomsday-year"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Doomsday of a year (quick) →
        </Link>
      </div>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        The Doomsday method
      </h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        A mental shortcut to find the weekday for any Gregorian date. Named after
        “Doomsday” anchor dates in each year that share the same weekday.
      </p>

      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-lg font-semibold">This year ({year})</h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          The last day of February is{" "}
          <span className="font-mono tabular-nums">
            February {febLast}, {year}
          </span>
          , a{" "}
          <strong className="font-semibold text-zinc-900 dark:text-zinc-50">
            {doomsdayName}
          </strong>
          . That weekday is this year’s Doomsday—every anchor below falls on it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Monthly anchors</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Memorize these calendar dates; each matches the year’s Doomsday
          weekday.
        </p>
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {MONTH_ANCHORS.map(({ month, note }) => (
            <li
              key={month}
              className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {month}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {note}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Year and century</h2>
        <ol className="list-decimal space-y-3 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong className="text-zinc-900 dark:text-zinc-50">
              Century anchor:
            </strong>{" "}
            Gregorian centuries have a fixed weekday anchor (often learned as a
            small table, e.g. 1900 → Wednesday, 2000 → Tuesday). Memorize the
            entries for the year ranges you practice.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-50">
              Year within century:
            </strong>{" "}
            Count leap years and use the “+12 years, −1 weekday” (or similar)
            shortcut from a reference you memorize, then combine with the century
            anchor to get that year’s Doomsday.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-zinc-50">
              Target date:
            </strong>{" "}
            From the nearest anchor in that month, step by sevens to your date
            and read off the weekday.
          </li>
        </ol>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Full detail and variants:{" "}
        <a
          href="https://en.wikipedia.org/wiki/Doomsday_rule"
          className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          Doomsday rule (Wikipedia)
        </a>
        .
      </p>
    </div>
  );
}
