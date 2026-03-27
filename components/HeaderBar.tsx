import Link from "next/link";
import { getAuth } from "@/lib/auth/server";
import { HeaderNav } from "@/components/HeaderNav";

export async function HeaderBar() {
  const auth = getAuth();
  const user = auth ? ((await auth.getSession()).data?.user ?? null) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div
        className="relative mx-auto flex max-w-3xl items-center gap-2 px-3 sm:gap-3 sm:px-4"
        style={{
          paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "0.5rem",
        }}
      >
        <Link
          href="/"
          className="shrink-0 max-w-[42%] truncate py-2 text-sm font-semibold tracking-tight text-zinc-900 sm:max-w-none dark:text-zinc-50"
        >
          Weekday trainer
        </Link>

        <HeaderNav
          user={
            user
              ? { email: user.email, name: user.name }
              : null
          }
        />
      </div>
    </header>
  );
}
