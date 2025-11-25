"use client";

/**
 * Market Card Component
 *
 * Displays a market preview with:
 * - Title and image
 * - Outcome probabilities
 * - Volume and liquidity stats
 * - Time until expiration
 */

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketSummary } from "@/lib/types";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format a number with K/M/B suffixes for compact display.
 */
function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

/**
 * Format time remaining until expiration.
 */
function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return "< 1h";
}

/**
 * Format price as percentage.
 */
function formatPercent(price: number): string {
  return `${(price * 100).toFixed(0)}%`;
}

// =============================================================================
// Outcome Bar Component
// =============================================================================

interface OutcomeBarProps {
  title: string;
  price: number;
  isLeading?: boolean;
}

function OutcomeBar({ title, price, isLeading }: OutcomeBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className={cn("truncate", isLeading && "font-medium")}>{title}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isLeading ? "bg-emerald-500" : "bg-muted-foreground/30"
            )}
            style={{ width: `${price * 100}%` }}
          />
        </div>
        <span
          className={cn(
            "w-10 text-right font-mono text-xs",
            isLeading ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          )}
        >
          {formatPercent(price)}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Market Card Component
// =============================================================================

interface MarketCardProps {
  market: MarketSummary;
}

export function MarketCard({ market }: MarketCardProps) {
  // Find the leading outcome (highest probability)
  const leadingOutcome = market.outcomes.reduce((prev, current) =>
    current.price > prev.price ? current : prev
  );

  // Get state badge color
  const stateBadgeVariant =
    market.state === "open"
      ? "default"
      : market.state === "resolved"
        ? "secondary"
        : "outline";

  return (
    <Link href={`/markets/${market.slug}`}>
      <Card className="group h-full transition-all hover:border-foreground/20 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Market Image */}
            {market.imageUrl && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={market.imageUrl}
                  alt={market.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-foreground/80">
                {market.title}
              </h3>
              {/* Topics */}
              <div className="mt-1 flex flex-wrap gap-1">
                {market.topics.slice(0, 2).map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Outcomes */}
          <div className="space-y-2">
            {market.outcomes.slice(0, 2).map((outcome) => (
              <OutcomeBar
                key={outcome.id}
                title={outcome.title}
                price={outcome.price}
                isLeading={outcome.id === leadingOutcome.id}
              />
            ))}
            {market.outcomes.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{market.outcomes.length - 2} more outcomes
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span title="24h Volume">
                <span className="font-medium text-foreground">${formatCompact(market.volume24h)}</span> vol
              </span>
              <span title="Liquidity">
                <span className="font-medium text-foreground">${formatCompact(market.liquidity)}</span> liq
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stateBadgeVariant} className="text-[10px]">
                {market.state}
              </Badge>
              <span>{formatTimeRemaining(market.expiresAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

