"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SignOutForm } from "@/components/SignOutForm";

const navLinkClass =
  "flex shrink-0 items-center rounded-md px-2.5 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 sm:py-2 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-800";

const signInClass =
  "ml-1 flex shrink-0 items-center rounded-lg bg-zinc-900 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700 sm:py-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300";

const NAV_ITEMS = [
  { href: "/", label: "Practice" },
  { href: "/learn", label: "Learn" },
  { href: "/doomsday", label: "Doomsday" },
  { href: "/stats", label: "Stats" },
] as const;

export type HeaderNavUser = {
  email?: string | null;
  name?: string | null;
} | null;

function AuthInline({ user }: { user: NonNullable<HeaderNavUser> }) {
  return (
    <div className="ml-1 flex shrink-0 items-center gap-2 border-l border-zinc-200 pl-2 dark:border-zinc-700">
      <span
        className="hidden max-w-[100px] truncate text-xs text-zinc-500 md:inline dark:text-zinc-400"
        title={user.email ?? user.name ?? undefined}
      >
        {user.email ?? user.name}
      </span>
      <SignOutForm />
    </div>
  );
}

/** Same outer layout as AuthInline + sign-out control, for width measurement only. */
function AuthMeasure({ user }: { user: NonNullable<HeaderNavUser> }) {
  return (
    <div className="ml-1 flex shrink-0 items-center gap-2 border-l border-zinc-200 pl-2 dark:border-zinc-700">
      <span className="hidden max-w-[100px] truncate text-xs text-zinc-500 md:inline dark:text-zinc-400">
        {user.email ?? user.name ?? "\u00A0"}
      </span>
      <span className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        Sign out
      </span>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M18 6L6 18M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function HeaderNav({ user }: { user: HeaderNavUser }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const updateCompact = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const wide = window.matchMedia("(min-width: 640px)").matches;
    if (wide) {
      measure.style.maxWidth = `${container.clientWidth}px`;
      const wrapsToExtraRow = measure.scrollHeight > 52;
      const overflowsHorizontally = measure.scrollWidth > measure.clientWidth + 2;
      setCompact(wrapsToExtraRow || overflowsHorizontally);
    } else {
      measure.style.maxWidth = "";
      setCompact(measure.scrollWidth > container.clientWidth + 2);
    }
  }, []);

  useLayoutEffect(() => {
    updateCompact();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => updateCompact());
    ro.observe(container);
    const mql = window.matchMedia("(min-width: 640px)");
    mql.addEventListener("change", updateCompact);
    return () => {
      ro.disconnect();
      mql.removeEventListener("change", updateCompact);
    };
  }, [updateCompact, user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const first = menuPanelRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])"
    );
    first?.focus();
  }, [menuOpen]);

  const menuLinkClass =
    "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700";

  return (
    <div
      ref={containerRef}
      className="relative flex min-w-0 flex-1 items-center justify-end"
    >
      <div
        ref={measureRef}
        className="pointer-events-none absolute right-0 top-1/2 z-0 flex -translate-y-1/2 flex-nowrap items-center justify-end gap-0.5 opacity-0 sm:w-full sm:max-w-full sm:flex-wrap sm:gap-1"
        aria-hidden
        tabIndex={-1}
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <span key={href} className={navLinkClass}>
            {label}
          </span>
        ))}
        {user ? (
          <AuthMeasure user={user} />
        ) : (
          <span className={signInClass}>Sign in</span>
        )}
      </div>

      {!compact ? (
        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:flex-wrap sm:gap-1"
          aria-label="Main"
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass}>
              {label}
            </Link>
          ))}
          {user ? (
            <AuthInline user={user} />
          ) : (
            <Link href="/auth/sign-in" className={signInClass}>
              Sign in
            </Link>
          )}
        </nav>
      ) : (
        <>
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500"
            aria-expanded={menuOpen}
            aria-controls="header-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-zinc-950/25 dark:bg-black/40"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div
                id="header-nav-menu"
                ref={menuPanelRef}
                className="absolute right-0 top-full z-50 mt-1 w-[min(calc(100vw-1.5rem),16rem)] rounded-xl border border-zinc-200/90 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
                role="menu"
              >
                <nav className="flex flex-col px-1" aria-label="Main">
                  {NAV_ITEMS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={menuLinkClass}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      {(user.email ?? user.name) ? (
                        <p className="border-t border-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          {user.email ?? user.name}
                        </p>
                      ) : null}
                      <div className="border-t border-zinc-100 px-2 pt-2 dark:border-zinc-800">
                        <SignOutForm />
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/auth/sign-in"
                      className={`${menuLinkClass} mx-2 mt-1 justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200`}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  )}
                </nav>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
