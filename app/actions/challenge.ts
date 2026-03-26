"use server";

import {
  type Difficulty,
  getDifficultyYearRange,
  getUtcWeekday,
  isValidYmd,
  randomDateInRange,
} from "@/lib/weekday";

export type ChallengeDate = {
  year: number;
  month: number;
  day: number;
};

export async function createChallenge(
  difficulty: Difficulty
): Promise<ChallengeDate> {
  const range = getDifficultyYearRange(difficulty);
  return randomDateInRange(range.minYear, range.maxYear);
}

export type CheckAnswerResult = {
  correct: boolean;
  actualWeekday: number;
};

export async function checkAnswer(input: {
  year: number;
  month: number;
  day: number;
  weekday: number;
}): Promise<CheckAnswerResult> {
  const { year, month, day, weekday } = input;
  if (
    !isValidYmd(year, month, day) ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  ) {
    throw new Error("Invalid input");
  }
  const actualWeekday = getUtcWeekday(year, month, day);
  return {
    correct: actualWeekday === weekday,
    actualWeekday,
  };
}
