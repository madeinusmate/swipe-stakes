/**
 * Core Claim Functions for Myriad Protocol
 *
 * This file contains pure, framework-agnostic functions for building
 * claim transactions on Myriad prediction markets.
 *
 * **When can you claim?**
 *
 * 1. **Resolved Markets (Winnings):** After a market resolves, holders of the
 *    winning outcome can claim their tokens. Each winning share = 1 token.
 *
 * 2. **Voided Markets:** If a market is cancelled/voided, all participants can
 *    reclaim their original investment for each outcome they hold.
 *
 * @see https://docs.myriadprotocol.com for full API documentation
 */

import { encodeFunctionData, type Hex } from "viem";
import { PREDICTION_MARKET_ABI } from "@/lib/abis";
import type { TransactionCall } from "./trade";

// =============================================================================
// Types
// =============================================================================

/**
 * Parameters for building a claim winnings transaction.
 */
export interface BuildClaimWinningsParams {
  /** On-chain market ID */
  marketId: number;
  /** Prediction market contract address */
  predictionMarketAddress: Hex;
}

/**
 * Parameters for building a claim voided shares transaction.
 */
export interface BuildClaimVoidedParams {
  /** On-chain market ID */
  marketId: number;
  /** Outcome ID to claim voided shares for */
  outcomeId: number;
  /** Prediction market contract address */
  predictionMarketAddress: Hex;
}

/**
 * Union type for all claim parameters.
 */
export type BuildClaimParams =
  | ({ action: "claim_winnings" } & BuildClaimWinningsParams)
  | ({ action: "claim_voided" } & BuildClaimVoidedParams);

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Builds a transaction call for claiming winnings from a resolved market.
 *
 * **When to use:**
 * - After a market has been resolved
 * - You hold shares of the winning outcome
 * - The market status should be "resolved"
 *
 * **What happens:**
 * - Each winning share is redeemed for 1 token (e.g., 1 USDC)
 * - All your winning shares are claimed in one transaction
 * - Transaction will revert if you have no winning shares
 *
 * @returns Array with single claim transaction call
 */
export function buildClaimWinningsTransaction(
  params: BuildClaimWinningsParams
): TransactionCall[] {
  const { marketId, predictionMarketAddress } = params;

  const claimData = encodeFunctionData({
    abi: PREDICTION_MARKET_ABI,
    functionName: "claimWinnings",
    args: [BigInt(marketId)],
  });

  return [
    {
      to: predictionMarketAddress,
      data: claimData,
    },
  ];
}

/**
 * Builds a transaction call for claiming voided/cancelled market shares.
 *
 * **When to use:**
 * - A market has been voided (cancelled by admins)
 * - You hold shares in that market
 * - The market status should be "voided"
 *
 * **What happens:**
 * - Your shares for the specified outcome are refunded at cost basis
 * - Must call once per outcome you hold shares in
 * - Transaction will revert if you have no shares for that outcome
 *
 * @returns Array with single claim transaction call
 */
export function buildClaimVoidedTransaction(
  params: BuildClaimVoidedParams
): TransactionCall[] {
  const { marketId, outcomeId, predictionMarketAddress } = params;

  const claimData = encodeFunctionData({
    abi: PREDICTION_MARKET_ABI,
    functionName: "claimVoidedOutcomeShares",
    args: [BigInt(marketId), BigInt(outcomeId)],
  });

  return [
    {
      to: predictionMarketAddress,
      data: claimData,
    },
  ];
}

/**
 * Builds a transaction call for any claim action.
 *
 * Convenience function that dispatches to the appropriate builder based
 * on the action type.
 */
export function buildClaimTransaction(params: BuildClaimParams): TransactionCall[] {
  if (params.action === "claim_winnings") {
    return buildClaimWinningsTransaction({
      marketId: params.marketId,
      predictionMarketAddress: params.predictionMarketAddress,
    });
  } else {
    return buildClaimVoidedTransaction({
      marketId: params.marketId,
      outcomeId: params.outcomeId,
      predictionMarketAddress: params.predictionMarketAddress,
    });
  }
}

