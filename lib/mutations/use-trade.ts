"use client";

/**
 * Trade Mutation Hook
 *
 * TanStack Query mutation for executing buy/sell trades on Myriad.
 * Uses EIP-5792 sendCalls to batch approval + trade in a single popup.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSendCalls, useCallsStatus } from "wagmi";
import { useCallback, useState, useEffect } from "react";
import { encodeFunctionData, parseUnits, type Hex } from "viem";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { useNetwork } from "@/lib/network-context";
import { TOKENS, REFERRAL_CODE } from "@/lib/config";
import { marketKeys } from "@/lib/queries";
import { portfolioKeys } from "@/lib/queries/portfolio";
import type { TradeAction, TransactionStatus } from "@/lib/types";

// =============================================================================
// ABIs
// =============================================================================

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const PREDICTION_MARKET_ABI = [
  {
    name: "referralBuy",
    type: "function",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "outcomeId", type: "uint256" },
      { name: "minOutcomeSharesToBuy", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "code", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "referralSell",
    type: "function",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "outcomeId", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "maxOutcomeSharesToSell", type: "uint256" },
      { name: "code", type: "string" },
    ],
    outputs: [],
  },
] as const;

// =============================================================================
// Types
// =============================================================================

export interface TradeParams {
  /** Buy or sell */
  action: TradeAction;
  /** Market ID */
  marketId: number;
  /** Outcome ID */
  outcomeId: number;
  /** Token amount (spend for buy, receive for sell) */
  value: number;
  /** Slippage-adjusted share threshold from quote */
  sharesThreshold: number;
  /** Token contract address */
  tokenAddress: string;
  /** Token decimals (default 6 for USDC) */
  tokenDecimals?: number;
  /** Pre-encoded calldata from the quote API (deprecated - we encode locally now) */
  calldata?: string;
}

interface TradeResult {
  /** Transaction/bundle hash */
  hash: string;
  /** Action performed */
  action: TradeAction;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for executing trades (buy/sell) on Myriad.
 * Uses EIP-5792 sendCalls to batch approval + trade in a single wallet popup.
 */
export function useTrade() {
  const { address } = useAccount();
  const { data: abstractClient } = useAbstractClient();
  const { contracts, apiBaseUrl } = useNetwork();
  const queryClient = useQueryClient();
  const { sendCalls, data: bundleId, isPending: isSending, error: sendError } = useSendCalls();
  
  // Extract the bundle ID string from the sendCalls result
  const bundleIdString = typeof bundleId === "object" && bundleId !== null 
    ? bundleId.id 
    : bundleId;
  
  // Track bundle status
  const { data: callsStatus } = useCallsStatus({
    id: bundleIdString as string,
    query: {
      enabled: !!bundleIdString,
      refetchInterval: (data) => 
        data.state.data?.status === "pending" ? 1000 : false,
    },
  });

  // Track detailed transaction status
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [currentAction, setCurrentAction] = useState<TradeAction | null>(null);

  // Update status based on calls status
  useEffect(() => {
    if (callsStatus?.status === "success") {
      setStatus("confirmed");
      
      // Invalidate caches on success
      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      if (address) {
        queryClient.invalidateQueries({
          queryKey: portfolioKeys.user(apiBaseUrl, address),
        });
      }
      
      // Reset after delay
      setTimeout(() => {
        setStatus("idle");
        setCurrentAction(null);
      }, 3000);
    }
  }, [callsStatus?.status, queryClient, address, apiBaseUrl]);

  const mutation = useMutation({
    mutationFn: async (params: TradeParams): Promise<TradeResult> => {
      if (!address) throw new Error("Wallet not connected");
      if (!abstractClient) throw new Error("Abstract client not available");

      setCurrentAction(params.action);
      
      // Use the provided token address, or fall back to USDC as default
      const tokenAddress = (params.tokenAddress || TOKENS.USDC.address) as Hex;
      const predictionMarketAddress = contracts.predictionMarket as Hex;
      
      if (!tokenAddress) {
        throw new Error("No token address available for this market");
      }

      // Use token decimals (default to 6 for USDC)
      const tokenDecimals = params.tokenDecimals ?? 6;

      // Large approval amount (1 trillion for the token)
      const approvalAmount = parseUnits("1000000000000", tokenDecimals);

      // Build the calls array
      const calls: Array<{ to: Hex; data: Hex; value?: bigint }> = [];
      
      // Convert value and sharesThreshold to the correct decimals
      // The contract expects both in token decimals (e.g., 6 for USDC)
      const valueInDecimals = parseUnits(params.value.toString(), tokenDecimals);
      const sharesThresholdInDecimals = parseUnits(params.sharesThreshold.toString(), tokenDecimals);
      
      console.log("Trade params:", {
        marketId: params.marketId,
        outcomeId: params.outcomeId,
        value: params.value,
        valueInDecimals: valueInDecimals.toString(),
        sharesThreshold: params.sharesThreshold,
        sharesThresholdInDecimals: sharesThresholdInDecimals.toString(),
        tokenDecimals,
        referralCode: REFERRAL_CODE,
      });

      if (params.action === "buy") {
        setStatus("approving");
        
        // 1. Approval call
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [predictionMarketAddress, approvalAmount],
        });
        
        calls.push({
          to: tokenAddress,
          data: approveData,
        });

        // 2. Buy call - encode locally with correct decimals
        const buyData = encodeFunctionData({
          abi: PREDICTION_MARKET_ABI,
          functionName: "referralBuy",
          args: [
            BigInt(params.marketId),
            BigInt(params.outcomeId),
            sharesThresholdInDecimals, // minOutcomeSharesToBuy
            valueInDecimals, // value in token decimals
            REFERRAL_CODE || "", // referral code
          ],
        });
        
        calls.push({
          to: predictionMarketAddress,
          data: buyData,
        });
      } else {
        // Sell - no approval needed, encode locally
        setStatus("pending_signature");
        
        const sellData = encodeFunctionData({
          abi: PREDICTION_MARKET_ABI,
          functionName: "referralSell",
          args: [
            BigInt(params.marketId),
            BigInt(params.outcomeId),
            valueInDecimals, // value to receive in token decimals
            sharesThresholdInDecimals, // maxOutcomeSharesToSell
            REFERRAL_CODE || "", // referral code
          ],
        });
        
        calls.push({
          to: predictionMarketAddress,
          data: sellData,
        });
      }

      console.log("Sending batched calls:", calls);
      setStatus("pending_signature");

      // Send batched calls - single wallet popup!
      // sendCalls is async but returns void - the bundleId comes from the hook state
      await sendCalls({
        calls,
      });

      setStatus("confirming");

      return {
        hash: bundleIdString || "pending",
        action: params.action,
      };
    },

    onError: () => {
      setStatus("failed");
      setTimeout(() => {
        setStatus("idle");
        setCurrentAction(null);
      }, 3000);
    },
  });

  const trade = useCallback(
    (params: TradeParams) => mutation.mutateAsync(params),
    [mutation]
  );

  return {
    trade,
    status,
    isPending: mutation.isPending || isSending,
    isSuccess: callsStatus?.status === "success",
    isError: mutation.isError || !!sendError,
    error: mutation.error || sendError,
    data: mutation.data,
    reset: mutation.reset,
    bundleId: bundleIdString,
    callsStatus,
  };
}
