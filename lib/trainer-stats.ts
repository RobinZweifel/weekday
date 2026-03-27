import type { Difficulty } from "@/lib/weekday";

export const TRAINER_STATS_KEY = "weekday-trainer-stats";
export const HISTORY_LEN = 20;
export const MAX_ROUNDS_LOG = 2000;

/** Rounds longer than this (active time) are not stored — avoids AFK / idle skew. */
export const MAX_RECORDED_ANSWER_MS = 15 * 60 * 1000;

const ANSWER_MS_ROLLING = 50;

export const DIFFICULTY_ORDER: Difficulty[] = [
  "very_easy",
  "easy",
  "medium",
  "hard",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  very_easy: "Very easy",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export type ModeStats = {
  streak: number;
  history: boolean[];
};

export type RoundEntry = {
  at: number;
  difficulty: Difficulty;
  won: boolean;
  /** Active ms from when choices were available until the guess (excludes tab hidden & hidden choices). */
  answerMs?: number;
};

export type TrainerPersistedState = {
  version: 2;
  byDifficulty: Record<Difficulty, ModeStats>;
  rounds: RoundEntry[];
};

function emptyMode(): ModeStats {
  return { streak: 0, history: [] };
}

export function createDefaultTrainerState(): TrainerPersistedState {
  return {
    version: 2,
    byDifficulty: {
      very_easy: emptyMode(),
      easy: emptyMode(),
      medium: emptyMode(),
      hard: emptyMode(),
    },
    rounds: [],
  };
}

function parseMode(raw: unknown): ModeStats {
  if (!raw || typeof raw !== "object") return emptyMode();
  const o = raw as Record<string, unknown>;
  const streak = Number(o.streak);
  const history = o.history;
  return {
    streak: Number.isFinite(streak) ? Math.max(0, streak) : 0,
    history: Array.isArray(history)
      ? history.filter((x): x is boolean => typeof x === "boolean").slice(-HISTORY_LEN)
      : [],
  };
}

function parseRound(raw: unknown): RoundEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const at = Number(o.at);
  const difficulty = o.difficulty;
  const won = o.won;
  if (!Number.isFinite(at) || typeof won !== "boolean") return null;
  if (
    difficulty !== "very_easy" &&
    difficulty !== "easy" &&
    difficulty !== "medium" &&
    difficulty !== "hard"
  ) {
    return null;
  }
  const entry: RoundEntry = { at, difficulty, won };
  if ("answerMs" in o && o.answerMs != null) {
    const ms = Math.round(Number(o.answerMs));
    if (Number.isFinite(ms) && ms >= 0 && ms <= MAX_RECORDED_ANSWER_MS) {
      entry.answerMs = ms;
    }
  }
  return entry;
}

/** Validate and normalize JSON (e.g. from API / DB). Returns `null` if not v2-shaped. */
export function parseTrainerPayload(raw: unknown): TrainerPersistedState | null {
  if (!raw || typeof raw !== "object") return null;
  if ((raw as { version?: unknown }).version !== 2) return null;
  return normalizeV2(raw);
}

function normalizeV2(p: unknown): TrainerPersistedState {
  const base = createDefaultTrainerState();
  if (!p || typeof p !== "object") return base;
  const o = p as Record<string, unknown>;
  const bd = o.byDifficulty;
  if (bd && typeof bd === "object") {
    for (const diff of DIFFICULTY_ORDER) {
      const m = (bd as Record<string, unknown>)[diff];
      base.byDifficulty[diff] = parseMode(m);
    }
  }
  const rounds = o.rounds;
  if (Array.isArray(rounds)) {
    const parsed = rounds
      .map(parseRound)
      .filter((r): r is RoundEntry => r !== null);
    base.rounds = parsed.slice(-MAX_ROUNDS_LOG);
  }
  return base;
}

export function loadTrainerState(): TrainerPersistedState {
  if (typeof window === "undefined") return createDefaultTrainerState();
  try {
    const raw = localStorage.getItem(TRAINER_STATS_KEY);
    if (!raw) return createDefaultTrainerState();
    const p = JSON.parse(raw) as unknown;
    if (
      p &&
      typeof p === "object" &&
      (p as { version?: unknown }).version === 2
    ) {
      return normalizeV2(p);
    }
    if (
      p &&
      typeof p === "object" &&
      "streak" in p &&
      "history" in p &&
      !("version" in p)
    ) {
      const base = createDefaultTrainerState();
      base.byDifficulty.easy = parseMode(p);
      saveTrainerState(base);
      return base;
    }
    return createDefaultTrainerState();
  } catch {
    return createDefaultTrainerState();
  }
}

export function saveTrainerState(state: TrainerPersistedState) {
  try {
    localStorage.setItem(TRAINER_STATS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function applyRoundResult(
  state: TrainerPersistedState,
  difficulty: Difficulty,
  won: boolean,
  answerMs?: number
): TrainerPersistedState {
  const cur = state.byDifficulty[difficulty];
  const nextStreak = won ? cur.streak + 1 : 0;
  const nextHistory = [...cur.history, won].slice(-HISTORY_LEN);
  const byDifficulty = {
    ...state.byDifficulty,
    [difficulty]: { streak: nextStreak, history: nextHistory },
  };
  const round: RoundEntry = { at: Date.now(), difficulty, won };
  if (answerMs !== undefined && Number.isFinite(answerMs)) {
    const ms = Math.round(answerMs);
    if (ms >= 0 && ms <= MAX_RECORDED_ANSWER_MS) {
      round.answerMs = ms;
    }
  }
  const rounds = [...state.rounds, round].slice(-MAX_ROUNDS_LOG);
  return { version: 2, byDifficulty, rounds };
}

export function accuracyForMode(mode: ModeStats): number | null {
  if (mode.history.length === 0) return null;
  return Math.round(
    (mode.history.filter(Boolean).length / mode.history.length) * 100
  );
}

export type DayAggregate = {
  dayKey: string;
  label: string;
  wins: number;
  total: number;
};

function localDayKey(t: number): string {
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (!y || !m || !d) return dayKey;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: y !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(new Date(y, m - 1, d));
}

/** Last `dayCount` calendar days (local), oldest first; includes days with no rounds. */
export function dailyAggregatesLastDays(
  rounds: RoundEntry[],
  dayCount: number
): DayAggregate[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (dayCount - 1));

  const byDay = new Map<string, { wins: number; total: number }>();
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    byDay.set(key, { wins: 0, total: 0 });
  }

  for (const r of rounds) {
    const key = localDayKey(r.at);
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (r.won) bucket.wins += 1;
  }

  const keys = [...byDay.keys()].sort();
  return keys.map((dayKey) => {
    const b = byDay.get(dayKey)!;
    return {
      dayKey,
      label: formatDayLabel(dayKey),
      wins: b.wins,
      total: b.total,
    };
  });
}

export function totalRoundsForDifficulty(
  rounds: RoundEntry[],
  difficulty: Difficulty
): number {
  return rounds.filter((r) => r.difficulty === difficulty).length;
}

/** Rolling mean of `answerMs` for the last `maxSamples` rounds that recorded time. */
export function rollingMeanAnswerMs(
  rounds: RoundEntry[],
  difficulty: Difficulty,
  maxSamples: number = ANSWER_MS_ROLLING
): number | null {
  const slice = rounds.filter(
    (r) => r.difficulty === difficulty && r.answerMs != null
  );
  const last = slice.slice(-maxSamples);
  if (last.length === 0) return null;
  const sum = last.reduce((a, r) => a + (r.answerMs as number), 0);
  return Math.round(sum / last.length);
}

export function rollingMeanAnswerMsAllRounds(
  rounds: RoundEntry[],
  maxSamples: number = ANSWER_MS_ROLLING
): number | null {
  const slice = rounds.filter((r) => r.answerMs != null);
  const last = slice.slice(-maxSamples);
  if (last.length === 0) return null;
  const sum = last.reduce((a, r) => a + (r.answerMs as number), 0);
  return Math.round(sum / last.length);
}

export function formatAnswerDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return s < 10 ? `${s.toFixed(1)} s` : `${Math.round(s)} s`;
  const m = Math.floor(s / 60);
  const rs = Math.round(s - m * 60);
  return `${m}m ${String(rs).padStart(2, "0")}s`;
}
