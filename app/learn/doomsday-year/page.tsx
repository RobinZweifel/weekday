import Link from "next/link";

export const metadata = {
  title: "Find Doomsday for any year — Weekday trainer",
  description:
    "Short Gregorian recipe: weekday of the last day in February (Doomsday) for any year.",
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default function DoomsdayYearGuidePage() {
  return (
    <div className="mx-auto max-w-xl min-w-0 px-3 py-8 sm:px-4 sm:py-12">
      <div className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
        <Link
          href="/learn"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Full Doomsday method
        </Link>
        <Link
          href="/doomsday"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Year drill →
        </Link>
        <Link
          href="/doomsday/help"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cheat sheet →
        </Link>
      </div>

      <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Find a year’s Doomsday (fast)
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <strong className="font-medium text-zinc-900 dark:text-zinc-50">
          Doomsday
        </strong>{" "}
        is the weekday of the{" "}
        <strong className="font-medium text-zinc-900 dark:text-zinc-50">
          last day of February
        </strong>{" "}
        (Feb 28, or Feb 29 in a leap year). Same numbering as this app:{" "}
        <span className="whitespace-nowrap">0 = Sun … 6 = Sat.</span>
      </p>

      <ol className="mb-8 list-decimal space-y-6 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <li>
          <strong className="text-zinc-900 dark:text-zinc-50">
            Century anchor.
          </strong>{" "}
          Let <code className="font-mono text-xs text-zinc-800 dark:text-zinc-200">C</code>{" "}
          be the first two digits of the year (for 1987,{" "}
          <code className="font-mono text-xs">C = 19</code>). Compute
          <code className="mt-1 block rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            anchor = (5 × (C mod 4) + 2) mod 7
          </code>
          <span className="mt-2 block text-zinc-600 dark:text-zinc-400">
            Same pattern as the repeating table: 16xx &amp; 20xx → Tue (2), 17xx
            &amp; 21xx → Sun (0), 18xx &amp; 22xx → Fri (5), 19xx &amp; 23xx →
            Wed (3).
          </span>
        </li>
        <li>
          <strong className="text-zinc-900 dark:text-zinc-50">
            Last two digits.
          </strong>{" "}
          Let{" "}
          <code className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
            y = year mod 100
          </code>
          . Set
          <code className="mt-1 block rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            a = ⌊y / 12⌋, b = y mod 12, c = ⌊b / 4⌋
          </code>
        </li>
        <li>
          <strong className="text-zinc-900 dark:text-zinc-50">Add mod 7.</strong>
          <code className="mt-1 block rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            Doomsday = (anchor + a + b + c) mod 7
          </code>
          → weekday name: {WEEKDAYS.join(", ")} for 0–6.
        </li>
      </ol>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Example: 2025
        </h2>
        <ul className="space-y-1.5 font-mono text-xs text-zinc-800 tabular-nums dark:text-zinc-200">
          <li>C = 20 → anchor = (5×0 + 2) mod 7 = 2 → {WEEKDAYS[2]}</li>
          <li>y = 25 → a = 2, b = 1, c = 0</li>
          <li>(2 + 2 + 1 + 0) mod 7 = 5 → {WEEKDAYS[5]}</li>
        </ul>
      </section>

      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Example: 1987
        </h2>
        <ul className="space-y-1.5 font-mono text-xs text-zinc-800 tabular-nums dark:text-zinc-200">
          <li>C = 19 → anchor = (5×3 + 2) mod 7 = 3 → {WEEKDAYS[3]}</li>
          <li>y = 87 → a = 7, b = 3, c = 0</li>
          <li>(3 + 7 + 3 + 0) mod 7 = 6 → {WEEKDAYS[6]}</li>
        </ul>
      </section>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        After this, use the same Doomsday weekday with the{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          monthly anchors
        </Link>{" "}
        to reach any calendar date. More background:{" "}
        <a
          href="https://en.wikipedia.org/wiki/Doomsday_rule"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
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
