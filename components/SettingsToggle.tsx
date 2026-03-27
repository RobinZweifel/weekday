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
    <div className="flex w-full flex-col gap-2 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:py-3.5">
      <div className="min-w-0 flex-1 pr-0 sm:pr-2">
        <label
          htmlFor={switchId}
          className="cursor-pointer text-xs font-medium text-zinc-900 sm:text-sm dark:text-zinc-50"
        >
          {label}
        </label>
        {description ? (
          <p
            id={`${switchId}-description`}
            className="mt-1 hidden text-xs leading-relaxed text-zinc-500 sm:block dark:text-zinc-400"
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
        className="-m-1.5 inline-flex min-h-[40px] min-w-[40px] shrink-0 cursor-pointer items-center justify-center self-start rounded-lg p-1.5 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none sm:m-0 sm:min-h-0 sm:min-w-0 sm:rounded-none sm:p-0 sm:focus-visible:ring-offset-white dark:focus-visible:ring-zinc-500 dark:sm:focus-visible:ring-offset-zinc-950"
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
  );
}
