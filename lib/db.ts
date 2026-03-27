import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string | null {
  const u = process.env.DATABASE_URL?.trim();
  return u || null;
}

/** SQL tagged template; throws if `DATABASE_URL` is missing when invoked. */
export function getSql() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}
