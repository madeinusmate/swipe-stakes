"use client";

/**
 * Swipe Markets Page
 *
 * Tinder-style swipe interface for browsing and betting on prediction markets.
 * Features:
 * - Full-screen swipeable card stack
 * - Quick bet buttons (Yes/No)
 * - Card flip for market details
 * - Filter by category and sort order
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNetwork } from "@/lib/network-context";
import { useBetSettings } from "@/lib/bet-settings-context";
import { swipeMarketsQueryOptions } from "@/lib/queries";
import { getQuote } from "@/lib/myriad-api";
import { useTrade } from "@/lib/mutations";
import { USE_MOCK_DATA } from "@/lib/config";
import { SwipeHeader, CardStack, AuthGate, type SwipeFilters } from "@/components/swipe";
import type { MarketSummary } from "@/lib/types";
import { AuroraBackground } from "@/components/ui/aurora-background";

// =============================================================================
// Page Component
// =============================================================================

export default function SwipeMarketsPage() {
  const { status, address } = useAccount();
  const isConnected = status === "connected";
  const { apiBaseUrl, tokens } = useNetwork();
  const { quickBetAmount } = useBetSettings();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<SwipeFilters>({
    sort: "volume_24h",
    topics: undefined,
  });

  // Fetch markets
  const { data, isPending, error } = useQuery({
    ...swipeMarketsQueryOptions(apiBaseUrl, {
      networkId: 2741,
      tokenAddress: tokens.USDC.address,
      state: "open",
      sort: filters.sort,
      topics: filters.topics
        ? filters.topics.charAt(0).toUpperCase() + filters.topics.slice(1)
        : undefined,
    }),
  });

  // Trade mutation
  const { trade, isPending: isTradePending, status: tradeStatus } = useTrade();

  // Quote mutation for getting trade details before executing
  const quoteMutation = useMutation({
    mutationFn: async ({ market, outcomeId, amount }: { market: MarketSummary; outcomeId: number; amount: number }) => {
      const quote = await getQuote(apiBaseUrl, {
        marketSlug: market.slug,
        outcomeId,
        action: "buy",
        value: amount,
      });
      return { quote, market, outcomeId, amount };
    },
  });

  const handleBet = useCallback(
    async (market: MarketSummary, outcomeId: number) => {
      if (!isConnected) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (USE_MOCK_DATA) {
        toast.success("Mock bet placed!", {
          description: `You bet $${quickBetAmount} on ${market.outcomes.find(o => o.id === outcomeId)?.title}`,
        });
        return;
      }

      try {
        // Get quote first
        toast.loading("Getting quote...", { id: "quick-bet" });
        
        const { quote, amount } = await quoteMutation.mutateAsync({ market, outcomeId, amount: quickBetAmount });

        toast.loading("Confirm in wallet...", { id: "quick-bet" });

        // Execute trade
        await trade({
          action: "buy",
          marketId: market.id,
          outcomeId,
          value: amount,
          sharesThreshold: quote.sharesThreshold,
          tokenAddress: market.tokenAddress,
          tokenDecimals: 6,
        });

        toast.dismiss("quick-bet");
      } catch (error) {
        console.error("Quick bet failed:", error);
        toast.dismiss("quick-bet");
        toast.error("Bet failed", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    [isConnected, quoteMutation, trade, quickBetAmount]
  );

  const handleFiltersChange = useCallback((newFilters: SwipeFilters) => {
    setFilters(newFilters);
  }, []);

  // Filter out expired markets
  const markets = (data?.data ?? []).filter((market) => {
    if (!market.expiresAt) return true;
    return new Date(market.expiresAt).getTime() > Date.now();
  });

  // Show auth gate if not connected (skip in mock mode)
  if (!isConnected && !USE_MOCK_DATA) {
    return <AuthGate />;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <AuroraBackground/>
      {/* Header */}
      <SwipeHeader filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Main Content */}
      <div className="h-full w-full pt-20 pb-4 px-4">
        {isPending ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              <p className="text-lg font-medium">Failed to load markets</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          </div>
        ) : (
          <CardStack
            markets={markets}
            onBet={handleBet}
            isPending={isTradePending || quoteMutation.isPending}
          />
        )}
      </div>

      {/* Trade status indicator */}
      {(tradeStatus === "approving" || tradeStatus === "confirming" || tradeStatus === "pending_signature") && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-white animate-spin" />
          <span className="text-sm font-medium text-white">
            {tradeStatus === "approving" && "Approving..."}
            {tradeStatus === "pending_signature" && "Confirm in wallet..."}
            {tradeStatus === "confirming" && "Confirming..."}
          </span>
        </div>
      )}
    </div>
  );
}
