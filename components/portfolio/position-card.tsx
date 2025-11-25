"use client";

/**
 * Position Card Component
 *
 * Displays a single portfolio position with:
 * - Market and outcome info
 * - Shares held and current value
 * - Profit/loss display
 * - Claim button for resolved markets
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Position, PositionStatus } from "@/lib/types";

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function getStatusBadge(status: PositionStatus): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  switch (status) {
    case "ongoing":
      return { label: "Active", variant: "default" };
    case "won":
      return { label: "Won", variant: "default" };
    case "lost":
      return { label: "Lost", variant: "destructive" };
    case "claimed":
      return { label: "Claimed", variant: "secondary" };
    case "sold":
      return { label: "Sold", variant: "outline" };
    default:
      return { label: status, variant: "outline" };
  }
}

// =============================================================================
// Component
// =============================================================================

interface PositionCardProps {
  position: Position & {
    marketTitle?: string;
    marketSlug?: string;
    outcomeTitle?: string;
    marketState?: "open" | "closed" | "resolved";
  };
}

export function PositionCard({ position }: PositionCardProps) {
  const statusBadge = getStatusBadge(position.status);
  const canClaim = position.winningsToClaim && !position.winningsClaimed;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Position Info */}
          <div className="min-w-0 flex-1">
            {position.marketSlug ? (
              <Link
                href={`/markets/${position.marketSlug}`}
                className="font-medium hover:underline"
              >
                {position.marketTitle || `Market #${position.marketId}`}
              </Link>
            ) : (
              <p className="font-medium">Market #{position.marketId}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {position.outcomeTitle || `Outcome #${position.outcomeId}`}
            </p>
            <Badge variant={statusBadge.variant} className="mt-2">
              {statusBadge.label}
            </Badge>
          </div>

          {/* Position Value */}
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(position.value)}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {position.shares.toFixed(2)} shares
            </p>
            <p
              className={cn(
                "text-sm font-medium tabular-nums",
                position.profit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCurrency(position.profit)} ({formatPercent(position.roi)})
            </p>
          </div>
        </div>

        {/* Claim Button - Links to market page for full claim flow */}
        {canClaim && position.marketSlug && (
          <div className="mt-4 border-t pt-4">
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Link href={`/markets/${position.marketSlug}`}>
                Claim Winnings
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
