-- Run this in the Neon SQL Editor (or psql) once per project.
-- Stores synced trainer stats keyed by Neon Auth user id.

CREATE TABLE IF NOT EXISTS user_trainer_stats (
  user_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_trainer_stats_updated_at_idx
  ON user_trainer_stats (updated_at DESC);
