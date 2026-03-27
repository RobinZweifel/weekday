export type OffsetDirection = "add" | "subtract";

/** Challenge: weekday in JS order (0 = Sun … 6 = Sat). */
export type OffsetChallengePayload = {
  baseWeekday: number;
  days: number;
  direction: OffsetDirection;
};

export const WEEKDAY_NAMES_SUN0 = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** 1–20 except 7 and 14 (whole weeks, trivial mod 7). */
export const OFFSET_DAY_VALUES: readonly number[] = [
  1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20,
];

function randomOffsetDays(): number {
  const i = Math.floor(Math.random() * OFFSET_DAY_VALUES.length);
  return OFFSET_DAY_VALUES[i]!;
}

/** Random base weekday, offset days (never 7 or 14), add or subtract (50/50). */
export function randomOffsetChallenge(): OffsetChallengePayload {
  return {
    baseWeekday: randomInt(0, 6),
    days: randomOffsetDays(),
    direction: Math.random() < 0.5 ? "add" : "subtract",
  };
}

export function weekdayAfterOffset(
  baseWeekday: number,
  days: number,
  direction: OffsetDirection
): number {
  const delta = direction === "add" ? days : -days;
  return (((baseWeekday + delta) % 7) + 7) % 7;
}

export function isValidOffsetChallenge(p: OffsetChallengePayload): boolean {
  const { baseWeekday, days, direction } = p;
  if (
    !Number.isInteger(baseWeekday) ||
    baseWeekday < 0 ||
    baseWeekday > 6 ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 20 ||
    days === 7 ||
    days === 14 ||
    (direction !== "add" && direction !== "subtract")
  ) {
    return false;
  }
  return true;
}
