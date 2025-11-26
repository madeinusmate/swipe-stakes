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
import { Wallet, TrendingUp, Activity, AlertCircle } from "lucide-react";

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
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {/* Total Value */}
      <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Worth</span>
            <div className="p-1.5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tabular-nums tracking-tight">{formatCurrency(totalValue)}</p>
          </div>
        </CardContent>
      </Card>

      {/* P&L */}
      <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500",
           totalProfit >= 0 ? "from-emerald-500/10" : "from-rose-500/10"
        )} />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total P&L</span>
            <div className={cn(
              "p-1.5 rounded-full group-hover:scale-110 transition-transform duration-300",
              totalProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              <TrendingUp className={cn("h-3.5 w-3.5", totalProfit < 0 && "rotate-180")} />
            </div>
          </div>
          <div className="space-y-1">
            <p className={cn(
                "text-2xl font-bold tabular-nums tracking-tight",
                totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
              {totalProfit >= 0 ? "+" : ""}
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="relative p-4">
           <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</span>
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tabular-nums tracking-tight">{activePositions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Claimable */}
      <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500",
          claimablePositions > 0 ? "from-amber-500/10" : "from-muted/10"
        )} />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Claimable</span>
            <div className={cn(
              "p-1.5 rounded-full group-hover:scale-110 transition-transform duration-300",
              claimablePositions > 0 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
            )}>
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
          </div>
           <div className="space-y-1">
            <p className={cn(
                "text-2xl font-bold tabular-nums tracking-tight",
                 claimablePositions > 0 ? "text-amber-500" : "text-foreground"
              )}>
              {claimablePositions}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

