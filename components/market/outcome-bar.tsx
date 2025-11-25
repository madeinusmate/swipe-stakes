"use client";

/**
 * Outcome Bar Component
 *
 * Displays an outcome with its probability and allows selection for trading.
 * Shows visual progress bar indicating probability.
 */

import { cn } from "@/lib/utils";
import type { Outcome } from "@/lib/types";

interface OutcomeBarProps {
  outcome: Outcome;
  isSelected?: boolean;
  onSelect?: (outcomeId: number) => void;
  showShares?: boolean;
}

/**
 * Format price as percentage.
 */
function formatPercent(price: number): string {
  return `${(price * 100).toFixed(1)}%`;
}

/**
 * Format shares count with K/M suffixes.
 */
function formatShares(shares: number): string {
  if (shares >= 1_000_000) return `${(shares / 1_000_000).toFixed(1)}M`;
  if (shares >= 1_000) return `${(shares / 1_000).toFixed(1)}K`;
  return shares.toFixed(0);
}

export function OutcomeBar({ outcome, isSelected, onSelect, showShares }: OutcomeBarProps) {
  const isClickable = Boolean(onSelect);

  // Color based on probability
  const getBarColor = (price: number) => {
    if (price >= 0.7) return "bg-emerald-500";
    if (price >= 0.4) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <button
      type="button"
      onClick={() => onSelect?.(outcome.id)}
      disabled={!isClickable}
      className={cn(
        "group relative w-full rounded-lg border p-4 text-left transition-all",
        isClickable && "cursor-pointer hover:border-foreground/30 hover:bg-accent/50",
        isSelected
          ? "border-foreground bg-accent"
          : "border-border bg-card",
        !isClickable && "cursor-default"
      )}
    >
      {/* Background progress bar */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-10 transition-opacity",
          isSelected ? "opacity-20" : "opacity-10",
          getBarColor(outcome.price)
        )}
        style={{ width: `${outcome.price * 100}%` }}
      />

      <div className="relative flex items-center justify-between">
        {/* Outcome info */}
        <div className="flex items-center gap-3">
          {/* Selection indicator */}
          {isClickable && (
            <div
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-colors",
                isSelected
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground/50 group-hover:border-foreground/50"
              )}
            >
              {isSelected && (
                <svg className="h-full w-full text-background" viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    d="M6.5 11.5L3 8l1-1 2.5 2.5L11 5l1 1z"
                  />
                </svg>
              )}
            </div>
          )}

          <div>
            <p className="font-medium">{outcome.title}</p>
            {showShares && outcome.shares > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatShares(outcome.shares)} shares
              </p>
            )}
          </div>
        </div>

        {/* Probability */}
        <div className="text-right">
          <p
            className={cn(
              "text-xl font-bold tabular-nums",
              outcome.price >= 0.7
                ? "text-emerald-600 dark:text-emerald-400"
                : outcome.price >= 0.4
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
            )}
          >
            {formatPercent(outcome.price)}
          </p>
          <p className="text-xs text-muted-foreground">probability</p>
        </div>
      </div>
    </button>
  );
}

