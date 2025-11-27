"use client";

/**
 * Trade Panel Component
 *
 * Main trading interface for buying and selling market outcomes.
 * Composed of smaller, focused sub-components for maintainability.
 *
 * Sub-components:
 * - ActionTabs: Buy/Sell toggle
 * - OutcomeSelector: Outcome selection list
 * - AmountInput: Trade amount with percentage shortcuts
 * - QuoteStats: Quote preview statistics
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNetwork } from "@/lib/network-context";
import { getQuote } from "@/lib/myriad-api";
import { useTrade } from "@/lib/mutations";
import { portfolioQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { TOKENS } from "@/lib/config";
import type { Market, TradeAction, Quote } from "@/lib/types";

// Sub-components
import { ActionTabs } from "./action-tabs";
import { OutcomeSelector } from "./outcome-selector";
import { AmountInput } from "./amount-input";
import { QuoteStats } from "./quote-stats";

// =============================================================================
// Types
// =============================================================================

interface TradePanelProps {
  market: Market;
  selectedOutcomeId: number;
  onOutcomeChange?: (outcomeId: number) => void;
}

// =============================================================================
// Custom Hooks
// =============================================================================

/**
 * Hook to fetch and manage quote data for trades.
 */
function useQuote(
  apiBaseUrl: string,
  networkId: number,
  marketId: number,
  outcomeId: number,
  action: TradeAction,
  amount: string,
  outcomePrice: number
) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let quoteParams: { value?: number; shares?: number };

      if (action === "buy") {
        quoteParams = { value: parsedAmount };
      } else {
        // For sell: convert USD value to shares (shares = usd / price)
        if (outcomePrice <= 0) {
          setError("Invalid price");
          setQuote(null);
          setIsLoading(false);
          return;
        }
        const sharesToSell = parsedAmount / outcomePrice;
        quoteParams = { shares: sharesToSell };
      }

      const newQuote = await getQuote(apiBaseUrl, {
        marketId,
        networkId,
        outcomeId,
        action,
        ...quoteParams,
        slippage: 0.01,
      });
      setQuote(newQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get quote");
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, marketId, networkId, outcomeId, action, amount, outcomePrice]);

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return { quote, isLoading, error, reset };
}

/**
 * Hook to get user's available balance for trading.
 */
function useAvailableBalance(
  address: string | undefined,
  action: TradeAction,
  apiBaseUrl: string,
  networkId: number,
  marketId: number,
  selectedOutcomeId: number,
  outcomePrice: number
) {
  // USDC balance for buying
  const { data: usdcBalanceRaw } = useReadContract({
    address: TOKENS.USDC.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && action === "buy",
      refetchInterval: 10000,
    },
  });

  const usdcBalance = useMemo(() => {
    if (!usdcBalanceRaw) return 0;
    return parseFloat(formatUnits(usdcBalanceRaw, TOKENS.USDC.decimals));
  }, [usdcBalanceRaw]);

  // Shares balance for selling
  const { data: portfolioData } = useQuery({
    ...portfolioQueryOptions(apiBaseUrl, address ?? "", {
      networkId,
      marketId,
    }),
    enabled: !!address && action === "sell",
  });

  const sharesBalance = useMemo(() => {
    if (!portfolioData?.data) return 0;
    const position = portfolioData.data.find(
      (p) => p.outcomeId === selectedOutcomeId
    );
    return position?.shares ?? 0;
  }, [portfolioData, selectedOutcomeId]);

  const sharesValueUsd = useMemo(() => {
    if (sharesBalance <= 0 || outcomePrice <= 0) return 0;
    return sharesBalance * outcomePrice;
  }, [sharesBalance, outcomePrice]);

  return action === "buy" ? usdcBalance : sharesValueUsd;
}

// =============================================================================
// Component
// =============================================================================

export function TradePanel({
  market,
  selectedOutcomeId,
  onOutcomeChange,
}: TradePanelProps) {
  const { status, address } = useAccount();
  const isConnected = status === "connected";
  const { apiBaseUrl, networkConfig } = useNetwork();
  const {
    trade,
    isPending: isTrading,
    isConfirming,
    status: tradeStatus,
  } = useTrade();

  const [action, setAction] = useState<TradeAction>("buy");
  const [amount, setAmount] = useState("");

  const selectedOutcome = market.outcomes.find(
    (o) => o.id === selectedOutcomeId
  );
  const outcomePrice = selectedOutcome?.price ?? 0;

  // Quote management
  const {
    quote,
    isLoading: isLoadingQuote,
    error: quoteError,
    reset: resetQuote,
  } = useQuote(
    apiBaseUrl,
    networkConfig.id,
    market.id,
    selectedOutcomeId,
    action,
    amount,
    outcomePrice
  );

  // Available balance
  const availableBalance = useAvailableBalance(
    address,
    action,
    apiBaseUrl,
    networkConfig.id,
    market.id,
    selectedOutcomeId,
    outcomePrice
  );

  // Trade execution
  const handleTrade = async () => {
    if (!quote || !amount) return;

    try {
      const sharesThreshold =
        action === "sell" ? quote.shares * 1.01 : quote.sharesThreshold;

      await trade({
        action,
        marketId: market.id,
        outcomeId: selectedOutcomeId,
        value: quote.value,
        sharesThreshold,
        tokenAddress: market.tokenAddress,
        tokenDecimals: 6,
      });

      setAmount("");
      resetQuote();
    } catch (err) {
      console.error("Trade failed:", err);
    }
  };

  const isMarketOpen = market.state === "open";

  // Trade button state
  const getTradeButtonContent = () => {
    if (isTrading || isConfirming) {
      switch (tradeStatus) {
        case "approving":
          return "Approving...";
        case "pending_signature":
          return "Confirm in wallet...";
        case "confirming":
          return "Confirming...";
        default:
          return "Processing...";
      }
    }
    return action === "buy" ? "Buy" : "Sell";
  };

  return (
    <Card className="bg-card border-border py-0 overflow-hidden">
      <CardContent className="p-0">
        {/* Buy/Sell Tabs */}
        <ActionTabs action={action} onChange={setAction} />

        <div className="p-4 space-y-4">
          {/* Outcome Selection */}
          <OutcomeSelector
            outcomes={market.outcomes}
            selectedOutcomeId={selectedOutcomeId}
            onSelect={(id) => onOutcomeChange?.(id)}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="p-4 space-y-4">
          {/* Amount Input */}
          <AmountInput
            value={amount}
            onChange={setAmount}
            availableBalance={availableBalance}
            isConnected={isConnected}
            isDisabled={!isMarketOpen}
          />

          {/* Action Button */}
          {!isConnected ? (
            <ConnectWalletButton className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" />
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
                  : "bg-rose-600 hover:bg-rose-700",
                "text-white"
              )}
              onClick={handleTrade}
              disabled={!quote || isTrading || isConfirming || isLoadingQuote}
            >
              {getTradeButtonContent()}
            </Button>
          )}

          {/* Quote Error */}
          {quoteError && (
            <p className="text-sm text-destructive">{quoteError}</p>
          )}

          {/* Stats Section */}
          <QuoteStats
            quote={quote}
            action={action}
            amount={amount}
            isLoading={isLoadingQuote}
          />
        </div>
      </CardContent>
    </Card>
  );
}

