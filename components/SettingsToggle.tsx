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
    <div className="flex w-full items-start justify-between gap-4 py-3.5">
      <div className="min-w-0 flex-1 pr-2">
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          {label}
        </label>
        {description ? (
          <p
            id={`${switchId}-description`}
            className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${switchId}-description` : undefined}
        onClick={() => onCheckedChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 ${
          checked
            ? "bg-zinc-900 dark:bg-zinc-100"
            : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-[transform] duration-200 ease-out dark:shadow-zinc-950/30 ${
            checked
              ? "translate-x-5 dark:bg-zinc-900"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
