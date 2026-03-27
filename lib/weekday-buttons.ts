/** Mon-first labels; values match JS `getUTCDay` (Sun = 0 … Sat = 6). */
export const WEEKDAYS_MON_FIRST: readonly { label: string; value: number }[] = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
] as const;

export type WeekdayChoice = (typeof WEEKDAYS_MON_FIRST)[number];

/** Fisher–Yates copy; new array each call. */
export function shuffleWeekdayOrder(): { label: string; value: number }[] {
  const copy = WEEKDAYS_MON_FIRST.map((x) => ({ label: x.label, value: x.value }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = t;
  }
  return copy;
}

/** 1 = Mon … 7 = Sun (keyboard hints). */
export function keyboardDigitForWeekday(value: number): number {
  const idx = WEEKDAYS_MON_FIRST.findIndex((x) => x.value === value);
  return idx < 0 ? 0 : idx + 1;
}

export function weekdayShortLabel(value: number): string {
  return WEEKDAYS_MON_FIRST.find((x) => x.value === value)?.label ?? "?";
}
