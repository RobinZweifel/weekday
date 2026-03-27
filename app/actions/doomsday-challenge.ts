"use server";

import {
  getDoomsdayWeekday,
  isValidGregorianYear,
  isValidDoomsdayChallengeRange,
  randomYearInInclusiveRange,
} from "@/lib/doomsday";

export type DoomsdayChallenge = { year: number };

export type DoomsdayYearRange = {
  minYear: number;
  maxYear: number;
};

export async function createDoomsdayChallenge(
  range: DoomsdayYearRange
): Promise<DoomsdayChallenge> {
  const { minYear, maxYear } = range;
  if (!isValidDoomsdayChallengeRange(minYear, maxYear)) {
    throw new Error("Invalid year range");
  }
  return { year: randomYearInInclusiveRange(minYear, maxYear) };
}

export type CheckDoomsdayResult = {
  correct: boolean;
  actualWeekday: number;
};

export async function checkDoomsdayAnswer(input: {
  year: number;
  weekday: number;
}): Promise<CheckDoomsdayResult> {
  const { year, weekday } = input;
  if (
    !isValidGregorianYear(year) ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  ) {
    throw new Error("Invalid input");
  }
  const actualWeekday = getDoomsdayWeekday(year);
  return {
    correct: actualWeekday === weekday,
    actualWeekday,
  };
}
