import Link from "next/link";
import { getAuth } from "@/lib/auth/server";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign in — Weekday trainer",
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const auth = getAuth();
  if (!auth) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Sign-in unavailable
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            NEON_AUTH_BASE_URL
          </code>{" "}
          from your Neon project (Branch → Auth → Configuration), then restart
          the dev server.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
        >
          Back home
        </Link>
      </div>
    );
  }

  return <SignInForm />;
}
