"use client";

type SettingsToggleProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
};

export function SettingsToggle({
  checked,
  onCheckedChange,
  label,
  description,
  id,
}: SettingsToggleProps) {
  const switchId = id ?? label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="flex w-full flex-col gap-2 py-2.5 sm:gap-2.5 sm:py-3.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={switchId}
          className="min-w-0 flex-1 cursor-pointer text-xs font-medium leading-snug text-zinc-900 sm:text-sm dark:text-zinc-50"
        >
          {label}
        </label>
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={description ? `${switchId}-description` : undefined}
          onClick={() => onCheckedChange(!checked)}
          className="-m-1 inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-offset-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 sm:-m-0.5 sm:min-h-[40px] sm:min-w-[40px]"
        >
          <span
            aria-hidden
            className={`relative inline-flex h-6 w-11 rounded-full p-0.5 transition-colors ${
              checked
                ? "bg-zinc-900 dark:bg-zinc-100"
                : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-[transform] duration-200 ease-out dark:shadow-zinc-950/30 ${
                checked ? "translate-x-5 dark:bg-zinc-900" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </div>
      {description ? (
        <p
          id={`${switchId}-description`}
          className="text-[11px] leading-relaxed text-zinc-500 sm:text-xs dark:text-zinc-400"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
