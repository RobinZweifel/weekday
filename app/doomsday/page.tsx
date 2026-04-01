import Link from "next/link";
import { DoomsdayTrainer } from "@/components/DoomsdayTrainer";

export const metadata = {
  title: "Doomsday drill — Weekday trainer",
  description: "Practice finding the Doomsday weekday for a given year",
};

export default function DoomsdayPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-stretch justify-start px-2 py-1 sm:items-center sm:justify-center sm:px-4 sm:py-16">
      <DoomsdayTrainer />
      <p className="mt-8 hidden max-w-md text-pretty text-center text-sm leading-relaxed text-zinc-500 sm:mt-10 sm:block dark:text-zinc-400">
        Set the year span with presets, number fields, nudges, or the slider
        (your range is saved in this browser). Open the{" "}
        <Link
          href="/doomsday/help"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          cheat sheet
        </Link>
        , review anchors on the{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Learn
        </Link>{" "}
        page, or go{" "}
        <Link
          href="/"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          back to full dates
        </Link>
        .
      </p>
    </div>
  );
}
