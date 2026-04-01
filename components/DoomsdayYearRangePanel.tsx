"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  DOOMSDAY_DEFAULT_RANGE,
  DOOMSDAY_RANGE_PRESETS,
  DOOMSDAY_SLIDER_MAX,
  DOOMSDAY_SLIDER_MIN,
  NUDGE_STEPS,
  nudgeDoomsdayRange,
  parseDoomsdaySliderTuple,
  presetMatchesRange,
} from "@/lib/doomsday";
import { cn } from "@/lib/utils";

export type DoomsdayYearRangePanelProps = {
  sliderRange: [number, number];
  onSliderPreview: (range: [number, number]) => void;
  /** Persists range and loads a new random year (presets, inputs, nudges, slider release). */
  onCommit: (range: [number, number]) => void;
  /** Tighter layout for mobile sheet / small screens. */
  density?: "default" | "compact";
  className?: string;
};

function useSortedBounds(range: [number, number]) {
  const lo = Math.min(range[0], range[1]);
  const hi = Math.max(range[0], range[1]);
  const span = hi - lo + 1;
  return { lo, hi, span };
}

function YearInput({
  id,
  label,
  value,
  minAllowed,
  maxAllowed,
  onCommit,
  compact,
}: {
  id: string;
  label: string;
  value: number;
  minAllowed: number;
  maxAllowed: number;
  onCommit: (n: number) => void;
  compact?: boolean;
}) {
  const [str, setStr] = useState(() => String(value));

  useEffect(() => {
    setStr(String(value));
  }, [value]);

  const apply = useCallback(() => {
    const trimmed = str.trim();
    if (trimmed === "") {
      setStr(String(value));
      return;
    }
    const n = Math.round(Number.parseInt(trimmed, 10));
    if (!Number.isFinite(n)) {
      setStr(String(value));
      return;
    }
    const clamped = Math.min(maxAllowed, Math.max(minAllowed, n));
    setStr(String(clamped));
    onCommit(clamped);
  }, [str, value, minAllowed, maxAllowed, onCommit]);

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", compact ? "gap-0.5" : "gap-1")}>
      <label
        htmlFor={id}
        className={cn(
          "font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400",
          compact ? "text-[9px]" : "text-[10px] sm:text-xs"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${id}-hint`}
        value={str}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
          setStr(d);
        }}
        onBlur={apply}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        className={cn(
          "w-full min-w-0 rounded-lg border border-zinc-200 bg-white text-center font-mono font-semibold tabular-nums text-zinc-900 outline-none transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25",
          compact
            ? "px-2 py-1.5 text-sm focus:ring-1"
            : "px-3 py-2.5 text-base sm:py-2 sm:text-lg"
        )}
      />
      <p id={`${id}-hint`} className="sr-only">
        Integer year between {minAllowed} and {maxAllowed}.
      </p>
    </div>
  );
}

function RangeTrackVisual({
  lo,
  hi,
  thin,
}: {
  lo: number;
  hi: number;
  thin?: boolean;
}) {
  const full = DOOMSDAY_SLIDER_MAX - DOOMSDAY_SLIDER_MIN;
  const leftPct = ((lo - DOOMSDAY_SLIDER_MIN) / full) * 100;
  const widthPct = ((hi - lo) / full) * 100;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800",
        thin ? "h-1" : "h-2"
      )}
      aria-hidden
    >
      <div
        className="absolute inset-y-0 rounded-full bg-zinc-400/90 dark:bg-zinc-500"
        style={{
          left: `${leftPct}%`,
          width: `${Math.max(widthPct, 0.35)}%`,
        }}
      />
    </div>
  );
}

export function DoomsdayYearRangePanel({
  sliderRange,
  onSliderPreview,
  onCommit,
  density = "default",
  className,
}: DoomsdayYearRangePanelProps) {
  const compact = density === "compact";
  const { lo, hi, span } = useSortedBounds(sliderRange);
  const baseId = useId();
  const minFieldId = `${baseId}-from`;
  const maxFieldId = `${baseId}-to`;

  const commitMin = useCallback(
    (n: number) => {
      const nextLo = Math.min(n, hi);
      if (nextLo === lo) return;
      onCommit([nextLo, hi]);
    },
    [hi, lo, onCommit]
  );

  const commitMax = useCallback(
    (n: number) => {
      const nextHi = Math.max(n, lo);
      if (nextHi === hi) return;
      onCommit([lo, nextHi]);
    },
    [lo, hi, onCommit]
  );

  const applyNudge = useCallback(
    (end: "min" | "max", delta: number) => {
      const next = nudgeDoomsdayRange(sliderRange, end, delta);
      if (next) onCommit(next);
    },
    [sliderRange, onCommit]
  );

  return (
    <div
      className={cn(
        "w-full min-w-0",
        compact ? "space-y-2" : "space-y-4",
        className
      )}
    >
      <div className={cn("text-center", compact && "space-y-0")}>
        <h3
          className={cn(
            "font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-300",
            compact ? "text-[10px]" : "text-[11px] sm:text-xs"
          )}
        >
          Practice year range
        </h3>
        <p
          className={cn(
            "font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50",
            compact ? "text-base leading-tight" : "mt-1 text-lg sm:text-xl"
          )}
        >
          {lo}–{hi}
        </p>
        {!compact ? (
          <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">
            {span.toLocaleString()} possible year{span === 1 ? "" : "s"} · random
            pick each round
          </p>
        ) : (
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
            {span.toLocaleString()} yrs · random each round
          </p>
        )}
      </div>

      <div className={cn(compact ? "space-y-1" : "space-y-2")}>
        {!compact ? (
          <p className="text-center text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
            Quick presets
          </p>
        ) : null}
        <div
          className={cn(
            "flex flex-wrap justify-center gap-1",
            !compact && "gap-1.5 sm:gap-2"
          )}
        >
          {DOOMSDAY_RANGE_PRESETS.map((p) => {
            const active = presetMatchesRange(sliderRange, p.range);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onCommit([p.range[0], p.range[1]])}
                className={cn(
                  "shrink-0 rounded-full border font-medium transition-colors",
                  compact
                    ? "min-h-7 px-2 py-0.5 text-[9px]"
                    : "min-h-9 max-w-full px-2.5 py-1.5 text-[11px] sm:min-h-0 sm:px-3 sm:text-xs",
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50/80 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              onCommit([
                DOOMSDAY_DEFAULT_RANGE[0],
                DOOMSDAY_DEFAULT_RANGE[1],
              ])
            }
            className={cn(
              "font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200",
              compact ? "text-[9px]" : "text-[10px] sm:text-xs"
            )}
          >
            Reset to default (1900–2100)
          </button>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border border-zinc-200/90 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30",
          compact ? "p-2" : "p-3"
        )}
      >
        {!compact ? (
          <p className="mb-2 text-center text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
            Type years, then Enter or leave the field to apply
          </p>
        ) : (
          <p className="mb-1.5 text-center text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
            Enter / blur to apply
          </p>
        )}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-end",
            compact ? "gap-2" : "gap-3 sm:gap-4"
          )}
        >
          <YearInput
            id={minFieldId}
            label="From (earliest)"
            value={lo}
            minAllowed={DOOMSDAY_SLIDER_MIN}
            maxAllowed={hi}
            onCommit={commitMin}
            compact={compact}
          />
          <span
            className="hidden self-end pb-2 text-zinc-300 sm:block dark:text-zinc-600"
            aria-hidden
          >
            —
          </span>
          <YearInput
            id={maxFieldId}
            label="To (latest)"
            value={hi}
            minAllowed={lo}
            maxAllowed={DOOMSDAY_SLIDER_MAX}
            onCommit={commitMax}
            compact={compact}
          />
        </div>
      </div>

      <div className={cn(compact ? "space-y-1" : "space-y-2")}>
        <p
          className={cn(
            "text-center font-medium text-zinc-500 dark:text-zinc-400",
            compact ? "text-[9px]" : "text-[10px] sm:text-xs"
          )}
        >
          Fine tune (−5 / −1 / +1 / +5)
        </p>
        <div
          className={cn(
            "grid sm:grid-cols-2",
            compact ? "grid-cols-2 gap-1.5" : "gap-3"
          )}
        >
          {(
            [
              { end: "min" as const, label: "Earlier bound" },
              { end: "max" as const, label: "Later bound" },
            ] as const
          ).map(({ end, label }) => (
            <div
              key={end}
              className={cn(
                "flex flex-col items-stretch rounded-lg border border-zinc-200/80 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/40",
                compact ? "gap-1 p-1.5" : "gap-1.5 p-2"
              )}
            >
              <span
                className={cn(
                  "text-center font-medium text-zinc-500 dark:text-zinc-400",
                  compact ? "text-[9px]" : "text-[10px]"
                )}
              >
                {label}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                {NUDGE_STEPS.map((step) => (
                  <button
                    key={`${end}-m${step}`}
                    type="button"
                    onClick={() => applyNudge(end, -step)}
                    className={cn(
                      "flex-1 rounded-lg border border-zinc-200 bg-white font-semibold tabular-nums text-zinc-800 transition-colors hover:bg-zinc-50 active:bg-zinc-100 sm:min-w-[2.5rem] sm:flex-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700",
                      compact
                        ? "min-h-8 min-w-0 px-1 py-1 text-[10px]"
                        : "min-h-10 min-w-10 text-xs sm:min-h-9"
                    )}
                    aria-label={`${label}: minus ${step} years`}
                  >
                    −{step}
                  </button>
                ))}
                {[...NUDGE_STEPS].reverse().map((step) => (
                  <button
                    key={`${end}-p${step}`}
                    type="button"
                    onClick={() => applyNudge(end, step)}
                    className={cn(
                      "flex-1 rounded-lg border border-zinc-200 bg-white font-semibold tabular-nums text-zinc-800 transition-colors hover:bg-zinc-50 active:bg-zinc-100 sm:min-w-[2.5rem] sm:flex-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700",
                      compact
                        ? "min-h-8 min-w-0 px-1 py-1 text-[10px]"
                        : "min-h-10 min-w-10 text-xs sm:min-h-9"
                    )}
                    aria-label={`${label}: plus ${step} years`}
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(compact ? "space-y-1" : "space-y-2")}>
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p
            className={cn(
              "font-medium text-zinc-500 dark:text-zinc-400",
              compact ? "text-[9px]" : "text-[10px] sm:text-xs"
            )}
          >
            Slider
          </p>
          <span
            className={cn(
              "text-right text-zinc-400 dark:text-zinc-500",
              compact ? "max-w-[55%] text-[8px] leading-tight" : "text-[10px]"
            )}
          >
            {compact ? "Release to apply" : "Release to apply · drag does not reload mid-drag"}
          </span>
        </div>
        <RangeTrackVisual lo={lo} hi={hi} thin={compact} />
        <Slider
          className={cn(
            "w-full [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:after:-inset-3 sm:[&_[data-slot=slider-thumb]]:size-3 sm:[&_[data-slot=slider-thumb]]:after:-inset-2",
            compact ? "py-1" : "py-2"
          )}
          min={DOOMSDAY_SLIDER_MIN}
          max={DOOMSDAY_SLIDER_MAX}
          step={1}
          minStepsBetweenValues={0}
          value={sliderRange}
          onValueChange={(v) => {
            const t = parseDoomsdaySliderTuple(v);
            if (t) onSliderPreview(t);
          }}
          onValueCommitted={(v) => {
            const t = parseDoomsdaySliderTuple(v);
            if (t) onCommit(t);
          }}
          aria-label="Gregorian year range for practice"
        />
        <div className="flex justify-between font-mono text-[10px] text-zinc-400 tabular-nums dark:text-zinc-500">
          <span>{DOOMSDAY_SLIDER_MIN}</span>
          <span>{DOOMSDAY_SLIDER_MAX}</span>
        </div>
      </div>
    </div>
  );
}
