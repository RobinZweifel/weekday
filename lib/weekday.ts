export type Difficulty = "very_easy" | "easy" | "medium" | "hard";

export const DIFFICULTY_YEAR_RANGE: Record<
  Exclude<Difficulty, "very_easy">,
  { minYear: number; maxYear: number }
> = {
  easy: { minYear: 2015, maxYear: 2035 },
  medium: { minYear: 1900, maxYear: 2099 },
  hard: { minYear: 1600, maxYear: 2399 },
};

/** `very_easy` uses current UTC year ± 2; others use fixed ranges. */
export function getDifficultyYearRange(
  difficulty: Difficulty,
  referenceUtcYear: number = new Date().getUTCFullYear()
): { minYear: number; maxYear: number } {
  if (difficulty === "very_easy") {
    return {
      minYear: referenceUtcYear - 2,
      maxYear: referenceUtcYear + 2,
    };
  }
  return DIFFICULTY_YEAR_RANGE[difficulty];
}

/** 0 = Sunday … 6 = Saturday (matches `Date.prototype.getUTCDay`) */
export function getUtcWeekday(
  year: number,
  month: number,
  day: number
): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function randomDateInRange(
  minYear: number,
  maxYear: number
): { year: number; month: number; day: number } {
  const year = randomInt(minYear, maxYear);
  const month = randomInt(1, 12);
  const dim = daysInMonth(year, month);
  const day = randomInt(1, dim);
  return { year, month, day };
}

export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** Last calendar day in February (28 or 29); always a Doomsday anchor. */
export function lastFebruaryDay(year: number): number {
  return isGregorianLeapYear(year) ? 29 : 28;
}

export function isValidYmd(
  year: number,
  month: number,
  day: number
): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}
