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

export function sortDoomsdayRange(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a];
}

/** Range slider / server payload: ordered [minYear, maxYear]. */
export function parseDoomsdaySliderTuple(
  v: readonly number[] | number
): [number, number] | null {
  if (!Array.isArray(v) || v.length !== 2) return null;
  const x = Math.round(v[0]!);
  const y = Math.round(v[1]!);
  if (!isValidDoomsdayChallengeRange(x, y)) return null;
  return sortDoomsdayRange(x, y);
}

export const NUDGE_STEPS = [5, 1] as const;

/** Nudge lower or upper bound; keeps [lo, hi] sorted and in slider bounds. */
export function nudgeDoomsdayRange(
  range: [number, number],
  end: "min" | "max",
  delta: number
): [number, number] | null {
  const lo = Math.min(range[0], range[1]);
  const hi = Math.max(range[0], range[1]);
  let newLo = lo;
  let newHi = hi;
  if (end === "min") {
    newLo = lo + delta;
    newLo = Math.max(DOOMSDAY_SLIDER_MIN, newLo);
    newLo = Math.min(newLo, hi);
  } else {
    newHi = hi + delta;
    newHi = Math.min(DOOMSDAY_SLIDER_MAX, newHi);
    newHi = Math.max(newHi, lo);
  }
  if (newLo === lo && newHi === hi) return null;
  if (!isValidDoomsdayChallengeRange(newLo, newHi)) return null;
  return [newLo, newHi];
}

export type DoomsdayRangePreset = {
  id: string;
  label: string;
  range: readonly [number, number];
};

/** Common practice spans — all valid within slider bounds. */
export const DOOMSDAY_RANGE_PRESETS: readonly DoomsdayRangePreset[] = [
  { id: "default", label: "1900–2100", range: [1900, 2100] },
  { id: "c20", label: "1900–1999", range: [1900, 1999] },
  { id: "c21", label: "2000–2099", range: [2000, 2099] },
  { id: "recent", label: "2000–2030", range: [2000, 2030] },
  { id: "decades", label: "1950–2025", range: [1950, 2025] },
  { id: "wide", label: "1500–2500", range: [1500, 2500] },
];

export function presetMatchesRange(
  range: [number, number],
  preset: readonly [number, number]
): boolean {
  const lo = Math.min(range[0], range[1]);
  const hi = Math.max(range[0], range[1]);
  return lo === preset[0] && hi === preset[1];
}

/** Weekday of the last day of February (0 = Sun … 6 = Sat) — that year’s Doomsday. */
export function getDoomsdayWeekday(year: number): number {
  const day = lastFebruaryDay(year);
  return getUtcWeekday(year, 2, day);
}
