import { createAuthServer } from "@neondatabase/auth/next/server";

type AuthServer = ReturnType<typeof createAuthServer>;

let cached: AuthServer | null = null;

/** Neon Auth server client; `null` when `NEON_AUTH_BASE_URL` is not set. */
export function getAuth(): AuthServer | null {
  if (!process.env.NEON_AUTH_BASE_URL?.trim()) return null;
  if (!cached) cached = createAuthServer();
  return cached;
}
