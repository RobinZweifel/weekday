import Link from "next/link";
import { fetchTrainerStatsForSession } from "@/app/actions/trainer-sync";
import { getAuth } from "@/lib/auth/server";
import { WeekdayTrainer } from "@/components/WeekdayTrainer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const auth = getAuth();
  const session = auth ? (await auth.getSession()).data : null;
  const userId = session?.user?.id ?? null;
  const remoteStats = userId ? await fetchTrainerStatsForSession() : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-16">
      <WeekdayTrainer
        syncedUserId={userId}
        initialRemoteState={remoteStats}
      />
      <p className="mt-6 max-w-md text-pretty text-center text-xs leading-relaxed text-zinc-500 sm:mt-10 sm:text-sm dark:text-zinc-400">
        <Link
          href="/learn#weekday-numbers"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Weekday numbers
        </Link>
        <span className="text-zinc-400 dark:text-zinc-500"> · </span>
        Uses the Gregorian calendar (UTC date). Learn the{" "}
        <Link
          href="/learn"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Doomsday method
        </Link>{" "}
        or see{" "}
        <Link
          href="/stats"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          stats
        </Link>
        , or drill{" "}
        <Link
          href="/doomsday"
          className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
        >
          Doomsday by year
        </Link>
        .
      </p>
    </div>
  );
}
