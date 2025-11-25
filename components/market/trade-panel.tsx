"use client";

/**
 * Trade Panel Component
 *
 * Form for buying/selling outcome shares.
 * Includes:
 * - Action toggle (buy/sell)
 * - Amount input
 * - Quote preview (shares, fees, price impact)
 * - Execute trade button
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetwork } from "@/lib/network-context";
import { getQuote } from "@/lib/myriad-api";
import { useTrade } from "@/lib/mutations";
import { cn } from "@/lib/utils";
import type { Market, TradeAction, Quote } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

interface TradePanelProps {
  market: Market;
  selectedOutcomeId: number;
  onOutcomeChange?: (outcomeId: number) => void;
}

// =============================================================================
// Component
// =============================================================================

export function TradePanel({ market, selectedOutcomeId, onOutcomeChange }: TradePanelProps) {
  const { status, address } = useAccount();
  const isConnected = status === "connected";
  const { apiBaseUrl, networkConfig } = useNetwork();
  const { trade, isPending: isTrading, status: tradeStatus } = useTrade();

  // Form state
  const [action, setAction] = useState<TradeAction>("buy");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const selectedOutcome = market.outcomes.find((o) => o.id === selectedOutcomeId);

  // Fetch quote when amount changes
  const fetchQuote = useCallback(async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    setQuoteError(null);

    try {
      const newQuote = await getQuote(apiBaseUrl, {
        marketId: market.id,
        networkId: networkConfig.id,
        outcomeId: selectedOutcomeId,
        action,
        value,
        slippage: 0.01, // 1% slippage
      });
      setQuote(newQuote);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Failed to get quote");
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [apiBaseUrl, market.id, networkConfig.id, selectedOutcomeId, action, amount]);

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Handle trade execution
  const handleTrade = async () => {
    if (!quote || !amount) return;

    try {
      await trade({
        action,
        marketId: market.id,
        outcomeId: selectedOutcomeId,
        value: parseFloat(amount),
        sharesThreshold: quote.sharesThreshold,
        tokenAddress: market.tokenAddress,
      });

      // Reset form on success
      setAmount("");
      setQuote(null);
    } catch (err) {
      console.error("Trade failed:", err);
    }
  };

  // Market closed check
  const isMarketOpen = market.state === "open";

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Trade</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Action Toggle */}
        <Tabs value={action} onValueChange={(v) => setAction(v as TradeAction)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Selected Outcome */}
        {selectedOutcome && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {action === "buy" ? "Buying" : "Selling"}
            </p>
            <p className="font-medium">{selectedOutcome.title}</p>
            <p className="text-sm text-muted-foreground">
              Current: {(selectedOutcome.price * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Amount (USDC)
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isMarketOpen}
            min="0"
            step="0.01"
          />
        </div>

        {/* Quote Preview */}
        {(quote || isLoadingQuote) && (
          <div className="space-y-2 rounded-lg border p-3 text-sm">
            {isLoadingQuote ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : quote ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {action === "buy" ? "Shares to receive" : "Shares to sell"}
                  </span>
                  <span className="font-medium">{quote.shares.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Price</span>
                  <span className="font-medium">
                    {(quote.priceAverage * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span
                    className={cn(
                      "font-medium",
                      Math.abs(quote.priceAfter - quote.priceBefore) > 0.01
                        ? "text-amber-600"
                        : ""
                    )}
                  >
                    {((quote.priceAfter - quote.priceBefore) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="font-medium">${quote.fees.fee.toFixed(2)}</span>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Quote Error */}
        {quoteError && (
          <p className="text-sm text-destructive">{quoteError}</p>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button className="w-full" onClick={openConnectModal}>
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        ) : !isMarketOpen ? (
          <Button className="w-full" disabled>
            Market Closed
          </Button>
        ) : (
          <Button
            className={cn(
              "w-full",
              action === "buy"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            )}
            onClick={handleTrade}
            disabled={!quote || isTrading || isLoadingQuote}
          >
            {isTrading
              ? tradeStatus === "approving"
                ? "Approving..."
                : tradeStatus === "pending_signature"
                  ? "Confirm in wallet..."
                  : "Processing..."
              : `${action === "buy" ? "Buy" : "Sell"} ${selectedOutcome?.title}`}
          </Button>
        )}

        {/* Revenue Sharing Badge */}
        {market.fees?.distributor && market.fees.distributor > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            This market supports builder revenue sharing
          </p>
        )}
      </CardContent>
    </Card>
  );
}

