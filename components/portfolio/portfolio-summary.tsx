"use client";

/**
 * Portfolio Summary Component
 *
 * Displays aggregated portfolio statistics:
 * - Total value
 * - Total profit/loss
 * - Number of positions
 * - Claimable positions
 */

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/types";

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

// =============================================================================
// Component
// =============================================================================

interface PortfolioSummaryProps {
  positions: Position[];
}

export function PortfolioSummary({ positions }: PortfolioSummaryProps) {
  // Calculate summary stats
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0);
  const activePositions = positions.filter((p) => p.status === "ongoing").length;
  const claimablePositions = positions.filter((p) => p.winningsToClaim && !p.winningsClaimed).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(totalValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              totalProfit >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {totalProfit >= 0 ? "+" : ""}
            {formatCurrency(totalProfit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Active Positions</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{activePositions}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Claimable</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              claimablePositions > 0 && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {claimablePositions}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

