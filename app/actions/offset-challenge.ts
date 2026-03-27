"use server";

import {
  isValidOffsetChallenge,
  randomOffsetChallenge,
  type OffsetChallengePayload,
  type OffsetDirection,
  weekdayAfterOffset,
} from "@/lib/weekday-offset";
export type OffsetChallenge = OffsetChallengePayload;

export async function createOffsetChallenge(): Promise<OffsetChallenge> {
  return randomOffsetChallenge();
}

export type CheckOffsetResult = {
  correct: boolean;
  actualWeekday: number;
};

export async function checkOffsetAnswer(input: {
  baseWeekday: number;
  days: number;
  direction: OffsetDirection;
  weekday: number;
}): Promise<CheckOffsetResult> {
  const { baseWeekday, days, direction, weekday } = input;
  if (
    !isValidOffsetChallenge({ baseWeekday, days, direction }) ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  ) {
    throw new Error("Invalid input");
  }
  const actualWeekday = weekdayAfterOffset(baseWeekday, days, direction);
  return {
    correct: actualWeekday === weekday,
    actualWeekday,
  };
}
