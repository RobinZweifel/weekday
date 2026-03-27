import { getUtcWeekday, lastFebruaryDay } from "@/lib/weekday";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Absolute bounds for the Doomsday drill year-range slider. */
export const DOOMSDAY_SLIDER_MIN = 1500;
export const DOOMSDAY_SLIDER_MAX = 2500;

/** Suggested initial range (within slider bounds). */
export const DOOMSDAY_DEFAULT_RANGE: readonly [number, number] = [1900, 2100];

export function randomYearInInclusiveRange(
  minYear: number,
  maxYear: number
): number {
  const lo = Math.min(minYear, maxYear);
  const hi = Math.max(minYear, maxYear);
  return randomInt(lo, hi);
}

export function isValidGregorianYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1 && year <= 999_999;
}

export function isValidDoomsdayChallengeRange(
  minYear: number,
  maxYear: number
): boolean {
  if (!Number.isInteger(minYear) || !Number.isInteger(maxYear)) return false;
  if (minYear > maxYear) return false;
  if (minYear < DOOMSDAY_SLIDER_MIN || maxYear > DOOMSDAY_SLIDER_MAX) {
    return false;
  }
  return isValidGregorianYear(minYear) && isValidGregorianYear(maxYear);
}

/** Weekday of the last day of February (0 = Sun … 6 = Sat) — that year’s Doomsday. */
export function getDoomsdayWeekday(year: number): number {
  const day = lastFebruaryDay(year);
  return getUtcWeekday(year, 2, day);
}
