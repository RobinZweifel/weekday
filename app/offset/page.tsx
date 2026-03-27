import Link from "next/link";
import { OffsetTrainer } from "@/components/OffsetTrainer";

export const metadata = {
  title: "Weekday offset — Weekday trainer",
  description:
    "Practice adding and subtracting days from a weekday (mental calendar math).",
};

export default function OffsetPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-16">
      <OffsetTrainer />
      <p className="mt-8 hidden max-w-md text-pretty text-center text-sm leading-relaxed text-zinc-500 sm:mt-10 sm:block dark:text-zinc-400">
        Tip: reduce modulo 7 — e.g. 18 days ≡ 4 days on the week. Try{" "}
        <Link
          href="/"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          full-date practice
        </Link>
        ,{" "}
        <Link
          href="/doomsday"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Doomsday by year
        </Link>
        , or{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Learn
        </Link>
        .
      </p>
    </div>
  );
}
