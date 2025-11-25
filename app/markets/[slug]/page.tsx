"use client";

/**
 * Market Detail Page
 *
 * Displays full market information with:
 * - Market title, description, and metadata
 * - Outcome selection with probabilities
 * - Price chart with historical data
 * - Trade panel for buying/selling
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNetwork } from "@/lib/network-context";
import { marketQueryOptions } from "@/lib/queries";
import { OutcomeBar } from "@/components/market/outcome-bar";
import { PriceChart } from "@/components/market/price-chart";
import { TradePanel } from "@/components/market/trade-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// =============================================================================
// Helper Functions
// =============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function MarketDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-6 w-32" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default function MarketDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { apiBaseUrl, networkConfig } = useNetwork();

  // Selected outcome for trading
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);

  // Fetch market data
  const { data, isPending, error } = useQuery(marketQueryOptions(apiBaseUrl, slug));

  const market = data?.data;

  // Set initial selected outcome
  if (market && selectedOutcomeId === null && market.outcomes.length > 0) {
    setSelectedOutcomeId(market.outcomes[0].id);
  }

  if (isPending) {
    return <MarketDetailSkeleton />;
  }

  if (error || !market) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Market not found</h1>
          <p className="mt-2 text-muted-foreground">
            The market you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Markets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Market Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {market.imageUrl && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={market.imageUrl}
                      alt={market.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-xl font-bold leading-tight">{market.title}</h1>
                    <Badge
                      variant={
                        market.state === "open"
                          ? "default"
                          : market.state === "resolved"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {market.state}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {market.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              {market.description && (
                <p className="mt-4 text-sm text-muted-foreground">{market.description}</p>
              )}

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Volume (24h)</p>
                  <p className="font-medium">{formatCompact(market.volume24h)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Volume</p>
                  <p className="font-medium">{formatCompact(market.volume)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Liquidity</p>
                  <p className="font-medium">{formatCompact(market.liquidity)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(market.expiresAt)}</p>
                </div>
              </div>

              {/* Explorer Link */}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Market ID: {market.id}</span>
                <a
                  href={`${networkConfig.blockExplorer}/address/${market.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  View token <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {market.outcomes.map((outcome) => (
                <OutcomeBar
                  key={outcome.id}
                  outcome={outcome}
                  isSelected={selectedOutcomeId === outcome.id}
                  onSelect={setSelectedOutcomeId}
                  showShares
                />
              ))}
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart
                outcomes={market.outcomes}
                selectedOutcomeId={selectedOutcomeId ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Resolution Info (if resolved) */}
          {market.state === "resolved" && market.resolvedOutcomeId !== null && (
            <Card className="border-emerald-500/50 bg-emerald-500/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Market Resolved
                </h3>
                <p className="mt-1 text-sm">
                  Winning outcome:{" "}
                  <span className="font-medium">
                    {market.outcomes.find((o) => o.id === market.resolvedOutcomeId)?.title}
                  </span>
                </p>
                {market.resolutionSource && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Source: {market.resolutionSource}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trade Panel (Sticky on desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedOutcomeId !== null && (
            <TradePanel
              market={market}
              selectedOutcomeId={selectedOutcomeId}
              onOutcomeChange={setSelectedOutcomeId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

