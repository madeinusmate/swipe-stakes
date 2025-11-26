"use client";

/**
 * Position Card Component
 *
 * Displays a single portfolio position with:
 * - Market cover image with ambient glow
 * - Outcome title and market info
 * - Position stats (Shares, Avg Price, P&L)
 * - Claim functionality
 */

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Position, PositionStatus } from "@/lib/types";
import { ArrowUpRight, BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

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

function getStatusBadge(status: PositionStatus) {
  switch (status) {
    case "ongoing":
      return { label: "Active", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    case "won":
      return { label: "Won", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    case "lost":
      return { label: "Lost", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    case "claimed":
      return { label: "Claimed", className: "bg-muted text-muted-foreground border-border" };
    case "sold":
      return { label: "Sold", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-border" };
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
  const statusConfig = getStatusBadge(position.status);
  const canClaim = position.winningsToClaim && !position.winningsClaimed;
  
  // Determine P&L color
  const isProfitable = position.profit >= 0;
  const plColor = isProfitable ? "text-emerald-500" : "text-rose-500";
  const PLIcon = isProfitable ? TrendingUp : TrendingDown;

  return (
    <div className="group relative h-full">
      <Link 
        href={position.marketSlug ? `/markets/${position.marketSlug}` : "#"} 
        className={cn("block h-full", !position.marketSlug && "pointer-events-none")}
      >
        <Card className="h-full flex flex-col overflow-hidden border border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1 duration-300">
          
          {/* Cover Image Area */}
          <div className="relative h-40 w-full z-0">
             {/* Ambient Glow - Reduced opacity */}
            {position.imageUrl && (
              <div className="absolute inset-0 -z-10 overflow-visible">
                <Image
                  src={position.imageUrl}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110 opacity-10 dark:opacity-25"
                  aria-hidden="true"
                />
              </div>
            )}

            <div className="relative h-full w-full overflow-hidden bg-muted/50">
              {position.imageUrl ? (
                <Image
                  src={position.imageUrl}
                  alt={position.marketTitle || "Market"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              {/* Gradient Overlay for text readability if needed, though text is below now */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                 <Badge variant="outline" className={cn("backdrop-blur-md font-medium border shadow-sm", statusConfig.className)}>
                    {statusConfig.label}
                 </Badge>
              </div>

               {/* Outcome Badge */}
              <div className="absolute bottom-3 left-3 z-10">
                 <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-md bg-background/95 backdrop-blur-sm px-2.5 py-1 text-xs font-bold shadow-sm ring-1 ring-inset ring-white/10 text-foreground">
                       {position.outcomeTitle || `Outcome #${position.outcomeId}`}
                    </span>
                 </div>
              </div>
            </div>
          </div>

          <CardContent className="flex flex-1 flex-col p-5 relative z-10 bg-card">
            {/* Market Title */}
            <div className="mb-5">
               <h3 className="line-clamp-2 text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {position.marketTitle || `Market #${position.marketId}`}
               </h3>
            </div>

            {/* Stats Grid - Cleaned up */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mb-2">
               {/* Shares */}
               <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Shares</span>
                  <span className="font-semibold tabular-nums">{position.shares.toFixed(2)}</span>
               </div>
               
               {/* Avg Price */}
               <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Price</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(position.price)}</span>
               </div>

               {/* Divider */}
               <div className="col-span-2 border-t border-border/40" />

               {/* Current Value */}
               <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Value</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(position.value)}</span>
               </div>

               {/* P&L */}
               <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">P&L</span>
                  <div className={cn("flex items-center justify-end gap-1.5 font-bold tabular-nums", plColor)}>
                     <PLIcon className="h-3.5 w-3.5" />
                     <span>{formatCurrency(position.profit)}</span>
                  </div>
                  <span className={cn("text-xs font-medium tabular-nums", isProfitable ? "text-emerald-500/70" : "text-rose-500/70")}>
                    {formatPercent(position.roi)}
                  </span>
               </div>
            </div>

            {/* Claim Button - Only show when needed */}
            {canClaim && (
              <div className="mt-5 pt-4 border-t border-border/40">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  Claim Winnings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
