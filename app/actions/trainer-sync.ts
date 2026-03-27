"use server";

import { getAuth } from "@/lib/auth/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import {
  parseTrainerPayload,
  type TrainerPersistedState,
} from "@/lib/trainer-stats";
import { revalidatePath } from "next/cache";

const MISSING_TABLE_HINT =
  "Create the stats table: run db/schema.sql in the Neon SQL Editor.";

function isUndefinedTableError(e: unknown): boolean {
  return (
    e !== null &&
    typeof e === "object" &&
    "code" in e &&
    (e as { code: string }).code === "42P01"
  );
}

export async function upsertTrainerStats(
  payload: unknown
): Promise<{ ok: boolean; error?: string }> {
  const auth = getAuth();
  if (!auth) return { ok: false, error: "Auth not configured." };
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database not configured." };
  }
  const { data: session, error: sessionError } = await auth.getSession();
  if (sessionError || !session?.user?.id) {
    return { ok: false, error: "Not signed in." };
  }

  const parsed = parseTrainerPayload(payload);
  if (!parsed) return { ok: false, error: "Invalid stats payload." };

  const sql = getSql();
  const json = JSON.stringify(parsed);
  try {
    await sql`
      INSERT INTO user_trainer_stats (user_id, payload, updated_at)
      VALUES (${session.user.id}, ${json}::jsonb, now())
      ON CONFLICT (user_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        updated_at = now()
    `;
  } catch (e) {
    if (isUndefinedTableError(e)) {
      return { ok: false, error: MISSING_TABLE_HINT };
    }
    return { ok: false, error: "Could not save stats to the database." };
  }

  revalidatePath("/");
  revalidatePath("/stats");
  return { ok: true };
}

export async function fetchTrainerStatsForSession(): Promise<TrainerPersistedState | null> {
  const auth = getAuth();
  if (!auth || !isDatabaseConfigured()) return null;

  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;

  const sql = getSql();
  let rows: unknown[];
  try {
    rows = await sql`
      SELECT payload
      FROM user_trainer_stats
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `;
  } catch (e) {
    if (isUndefinedTableError(e)) return null;
    return null;
  }

  const row = rows[0] as { payload: unknown } | undefined;
  if (!row?.payload) return null;
  return parseTrainerPayload(row.payload);
}
