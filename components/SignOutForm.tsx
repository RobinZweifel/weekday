import { signOut } from "@/app/actions/auth";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none sm:py-1.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500"
      >
        Sign out
      </button>
    </form>
  );
}
