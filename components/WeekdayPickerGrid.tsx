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
  "flex w-full flex-col items-center justify-center rounded-md border border-zinc-200/90 bg-zinc-50 px-1 py-2 text-[11px] font-semibold leading-none tracking-tight text-zinc-800 transition-colors hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 max-sm:min-h-10 max-sm:touch-manipulation sm:mx-auto sm:min-h-0 sm:max-w-[6rem] sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm sm:font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500";

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
      className="mb-3 grid w-full grid-cols-3 gap-x-1.5 gap-y-1.5 sm:mx-auto sm:mb-6 sm:max-w-md sm:justify-items-center sm:gap-x-4 sm:gap-y-3"
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
