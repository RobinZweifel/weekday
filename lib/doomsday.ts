import {
  getDifficultyYearRange,
  getUtcWeekday,
  lastFebruaryDay,
  type Difficulty,
} from "@/lib/weekday";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function randomYearForDifficulty(
  difficulty: Difficulty,
  referenceUtcYear: number = new Date().getUTCFullYear()
): number {
  const { minYear, maxYear } = getDifficultyYearRange(
    difficulty,
    referenceUtcYear
  );
  return randomInt(minYear, maxYear);
}

/** Weekday of the last day of February (0 = Sun … 6 = Sat) — that year’s Doomsday. */
export function getDoomsdayWeekday(year: number): number {
  const day = lastFebruaryDay(year);
  return getUtcWeekday(year, 2, day);
}

export function isValidGregorianYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1 && year <= 999_999;
}
