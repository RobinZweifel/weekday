import type { Metadata } from "next";
import { fetchTrainerStatsForSession } from "@/app/actions/trainer-sync";
import { getAuth } from "@/lib/auth/server";
import { StatsDashboard } from "@/components/StatsDashboard";

export const metadata: Metadata = {
  title: "Stats — Weekday trainer",
  description: "Per-difficulty streak, accuracy, and practice history",
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const auth = getAuth();
  const session = auth ? (await auth.getSession()).data : null;
  const userId = session?.user?.id ?? null;
  const remoteStats = userId ? await fetchTrainerStatsForSession() : null;

  return (
    <div className="mx-auto max-w-3xl min-w-0 px-3 py-8 sm:px-4 sm:py-10">
      <StatsDashboard
        syncedUserId={userId}
        initialRemoteState={remoteStats}
      />
    </div>
  );
}
