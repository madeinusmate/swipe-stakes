"use client";

/**
 * Claim Mutation Hook
 *
 * TanStack Query mutation hook for claiming winnings or voided shares.
 * Uses EIP-5792 sendCalls for consistent transaction handling.
 *
 * **For the core transaction building logic, see:**
 * - `@/lib/contracts/claim` - Pure functions for building transactions
 * - `@/lib/abis` - Contract ABIs
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSendCalls, useCallsStatus } from "wagmi";
import { useCallback, useState, useEffect } from "react";
import { type Hex } from "viem";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { toast } from "sonner";
import { useNetwork } from "@/lib/network-context";
import { NETWORK } from "@/lib/config";
import { marketKeys, portfolioKeys } from "@/lib/queries";
import { buildClaimTransaction } from "@/lib/contracts";
import type { ClaimAction, TransactionStatus } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface ClaimParams {
  /** Type of claim */
  action: ClaimAction;
  /** Market ID */
  marketId: number;
  /** Outcome ID (required for voided claims) */
  outcomeId?: number;
}

interface ClaimResult {
  /** Transaction hash */
  hash: string;
  /** Action performed */
  action: ClaimAction;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for claiming winnings or voided shares.
 * Uses EIP-5792 sendCalls for consistent transaction handling.
 */
export function useClaim() {
  const { address } = useAccount();
  const { data: abstractClient } = useAbstractClient();
  const { contracts, apiBaseUrl } = useNetwork();
  const queryClient = useQueryClient();
  const { sendCallsAsync, isPending: isSending, error: sendError } = useSendCalls();
  const [bundleId, setBundleId] = useState<string | null>(null);

  const { data: callsStatus, isFetching: isPolling } = useCallsStatus({
    id: bundleId as string,
    query: {
      enabled: !!bundleId,
      staleTime: 0,
      // Poll every second until we get a final state (success/failure)
      refetchInterval: (query) => {
        const txStatus = query.state.data?.status;
        if (txStatus === "success" || txStatus === "failure") return false;
        return 1000;
      },
    },
  });

  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [currentAction, setCurrentAction] = useState<ClaimAction | null>(null);

  useEffect(() => {
    if (!callsStatus) return;

    const txStatus = callsStatus.status;

    if (txStatus === "success") {
      setStatus("confirmed");

      const txHash = callsStatus.receipts?.[callsStatus.receipts.length - 1]?.transactionHash;
      const explorerUrl = txHash
        ? `${NETWORK.blockExplorer}/tx/${txHash}`
        : undefined;

      toast.success(
        currentAction === "claim_winnings" ? "Winnings claimed!" : "Voided shares claimed!",
        {
          description: "Transaction confirmed on-chain",
          action: explorerUrl ? {
            label: "View",
            onClick: () => window.open(explorerUrl, "_blank"),
          } : undefined,
          duration: 5000,
        }
      );

      queryClient.invalidateQueries({ queryKey: marketKeys.all });
      if (address) {
        queryClient.invalidateQueries({
          queryKey: portfolioKeys.user(apiBaseUrl, address),
        });
      }

      setTimeout(() => {
        setStatus("idle");
        setCurrentAction(null);
        setBundleId(null);
      }, 3000);
    }

    if (txStatus === "failure") {
      console.error("Claim transaction failed:", callsStatus);
      setStatus("failed");

      toast.error("Claim failed", {
        description: "The transaction was reverted on-chain. Please try again.",
        duration: 5000,
      });

      setTimeout(() => {
        setStatus("idle");
        setCurrentAction(null);
        setBundleId(null);
      }, 3000);
    }
  }, [callsStatus, queryClient, address, apiBaseUrl, currentAction]);

  const mutation = useMutation({
    mutationFn: async (params: ClaimParams): Promise<ClaimResult> => {
      if (!address) throw new Error("Wallet not connected");
      if (!abstractClient) throw new Error("Abstract client not available");

      setCurrentAction(params.action);
      setStatus("pending_signature");

      const predictionMarketAddress = contracts.predictionMarket as Hex;

      // Build transaction calls using the core contract function
      let calls;
      if (params.action === "claim_winnings") {
        calls = buildClaimTransaction({
          action: "claim_winnings",
          marketId: params.marketId,
          predictionMarketAddress,
        });
      } else if (params.action === "claim_voided" && params.outcomeId !== undefined) {
        calls = buildClaimTransaction({
          action: "claim_voided",
          marketId: params.marketId,
          outcomeId: params.outcomeId,
          predictionMarketAddress,
        });
      } else {
        throw new Error("Invalid claim parameters");
      }

      const result = await sendCallsAsync({
        calls,
      });

      const resultBundleId = typeof result === "object" && result !== null
        ? result.id
        : result;

      setBundleId(resultBundleId);
      setStatus("confirming");

      return {
        hash: resultBundleId || "pending",
        action: params.action,
      };
    },

    onError: (error) => {
      console.error("Claim mutation error:", error);
      setStatus("failed");

      toast.error("Claim failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        duration: 5000,
      });

      setTimeout(() => {
        setStatus("idle");
        setCurrentAction(null);
        setBundleId(null);
      }, 3000);
    },
  });

  const claim = useCallback(
    (params: ClaimParams) => mutation.mutateAsync(params),
    [mutation]
  );

  const isConfirmed = callsStatus?.status === "success";
  const isFailed = callsStatus?.status === "failure";

  const reset = useCallback(() => {
    mutation.reset();
    setBundleId(null);
    setStatus("idle");
    setCurrentAction(null);
  }, [mutation]);

  return {
    claim,
    status,
    isPending: mutation.isPending || isSending,
    isConfirming: (isPolling || callsStatus?.status === "pending") && !!bundleId && !isConfirmed && !isFailed,
    isSuccess: isConfirmed,
    isError: mutation.isError || !!sendError || isFailed,
    error: mutation.error || sendError,
    data: mutation.data,
    reset,
    bundleId,
    callsStatus,
  };
}
