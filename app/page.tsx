import Link from "next/link";
import { WeekdayTrainer } from "@/components/WeekdayTrainer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <WeekdayTrainer />
      <p className="mt-10 max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
        Uses the Gregorian calendar (UTC date). Learn the{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Doomsday method
        </Link>
        .
      </p>
    </div>
  );
}
