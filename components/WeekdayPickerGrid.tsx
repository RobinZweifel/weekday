"use client";

import { useEffect, useState } from "react";
import {
  keyboardDigitForWeekday,
  shuffleWeekdayOrder,
} from "@/lib/weekday-buttons";

type WeekdayPickerGridProps = {
  /** When this string changes, weekday buttons are reshuffled. */
  shuffleKey: string;
  onPick: (value: number) => void;
  locked?: boolean;
  isChoiceDisabled?: (value: number) => boolean;
};

const btnClass =
  "mx-auto flex min-h-[40px] w-full max-w-[5.25rem] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-1.5 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 sm:min-h-0 sm:max-w-[6rem] sm:px-3 sm:py-2.5 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500";

export function WeekdayPickerGrid({
  shuffleKey,
  onPick,
  locked = false,
  isChoiceDisabled,
}: WeekdayPickerGridProps) {
  const [order, setOrder] = useState(() => shuffleWeekdayOrder());

  useEffect(() => {
    setOrder(shuffleWeekdayOrder());
  }, [shuffleKey]);

  return (
    <div
      className="mb-4 grid w-full max-w-md grid-cols-2 justify-items-center gap-x-3 gap-y-2 sm:mx-auto sm:mb-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-3"
      role="group"
      aria-label="Pick weekday"
    >
      {order.map(({ label, value }) => {
        const choiceOff = isChoiceDisabled?.(value) ?? false;
        const disabled = locked || choiceOff;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onPick(value)}
            className={btnClass}
          >
            <span className="block leading-none">{label}</span>
            <span className="mt-0.5 hidden text-[10px] font-normal text-zinc-400 sm:block dark:text-zinc-500">
              {keyboardDigitForWeekday(value)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
