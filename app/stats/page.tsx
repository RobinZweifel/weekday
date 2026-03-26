import type { Metadata } from "next";
import { StatsDashboard } from "@/components/StatsDashboard";

export const metadata: Metadata = {
  title: "Stats — Weekday trainer",
  description: "Per-difficulty streak, accuracy, and practice history",
};

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <StatsDashboard />
    </div>
  );
}
