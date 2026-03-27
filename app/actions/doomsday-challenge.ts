"use server";

import {
  getDoomsdayWeekday,
  isValidGregorianYear,
  randomYearForDifficulty,
} from "@/lib/doomsday";
import type { Difficulty } from "@/lib/weekday";

export type DoomsdayChallenge = { year: number };

export async function createDoomsdayChallenge(
  difficulty: Difficulty
): Promise<DoomsdayChallenge> {
  return { year: randomYearForDifficulty(difficulty) };
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
