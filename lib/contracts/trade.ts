/**
 * Core Trade Functions for Myriad Protocol
 *
 * This file contains pure, framework-agnostic functions for building
 * buy and sell transactions on Myriad prediction markets.
 *
 * **How to use these functions:**
 *
 * 1. Get a quote from the Myriad API to determine expected shares
 * 2. Use `buildBuyTransaction` or `buildSellTransaction` to create tx calls
 * 3. Send the calls using your preferred method (wagmi, viem, ethers, etc.)
 *
 * @see https://docs.myriadprotocol.com for full API documentation
 */

import { encodeFunctionData, parseUnits, type Hex } from "viem";
import { ERC20_ABI, PREDICTION_MARKET_ABI } from "@/lib/abis";

// =============================================================================
// Types
// =============================================================================

/**
 * A single transaction call to be executed on-chain.
 * Compatible with EIP-5792 sendCalls and similar batching methods.
 */
export interface TransactionCall {
  /** Contract address to call */
  to: Hex;
  /** Encoded function data */
  data: Hex;
  /** ETH value to send (usually 0 for ERC20 trades) */
  value?: bigint;
}

/**
 * Parameters for building a buy transaction.
 */
export interface BuildBuyParams {
  /** On-chain market ID */
  marketId: number;
  /** Outcome ID to buy (e.g., 0 for "Yes", 1 for "No") */
  outcomeId: number;
  /** Amount of tokens to spend */
  value: number;
  /** Minimum shares to receive (from quote.sharesThreshold) */
  minShares: number;
  /** Token contract address (e.g., USDC) */
  tokenAddress: Hex;
  /** Token decimals (6 for USDC, 18 for most others) */
  tokenDecimals: number;
  /** Prediction market contract address */
  predictionMarketAddress: Hex;
  /** Optional referral code for revenue sharing */
  referralCode?: string;
}

/**
 * Parameters for building a sell transaction.
 */
export interface BuildSellParams {
  /** On-chain market ID */
  marketId: number;
  /** Outcome ID to sell */
  outcomeId: number;
  /** Amount of tokens to receive */
  value: number;
  /** Maximum shares to sell (from quote.sharesThreshold) */
  maxShares: number;
  /** Token decimals for the market's token */
  tokenDecimals: number;
  /** Prediction market contract address */
  predictionMarketAddress: Hex;
  /** Optional referral code for revenue sharing */
  referralCode?: string;
}

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Builds transaction calls for buying outcome shares.
 *
 * Returns an array of calls that should be executed together:
 * 1. ERC20 approve (allows prediction market to spend tokens)
 * 2. referralBuy (executes the purchase)
 *
 * **Why two calls?**
 * ERC20 tokens require a separate approval before spending. Using EIP-5792
 * sendCalls, both transactions are batched into a single wallet popup.
 *
 * **Getting the minShares value:**
 * Call the Myriad quote API with your trade parameters. The response includes
 * `sharesThreshold` which accounts for slippage protection.
 *
 * @returns Array of transaction calls [approve, buy]
 */
export function buildBuyTransaction(params: BuildBuyParams): TransactionCall[] {
  const {
    marketId,
    outcomeId,
    value,
    minShares,
    tokenAddress,
    tokenDecimals,
    predictionMarketAddress,
    referralCode = "",
  } = params;

  const calls: TransactionCall[] = [];

  // Convert human-readable amounts to contract decimals
  const valueInDecimals = parseUnits(value.toString(), tokenDecimals);
  const minSharesInDecimals = parseUnits(minShares.toString(), tokenDecimals);

  // Step 1: Approve exact token amount for this trade
  // Since we batch approval + trade via sendCalls, we approve only what's needed
  const approveData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [predictionMarketAddress, valueInDecimals],
  });

  calls.push({
    to: tokenAddress,
    data: approveData,
  });

  // Step 2: Execute the buy
  const buyData = encodeFunctionData({
    abi: PREDICTION_MARKET_ABI,
    functionName: "referralBuy",
    args: [
      BigInt(marketId),
      BigInt(outcomeId),
      minSharesInDecimals, // Slippage protection: revert if fewer shares
      valueInDecimals,
      referralCode,
    ],
  });

  calls.push({
    to: predictionMarketAddress,
    data: buyData,
  });

  return calls;
}

/**
 * Builds a transaction call for selling outcome shares.
 *
 * Returns a single call - no approval needed since you're selling shares
 * you already own.
 *
 * **Getting the maxShares value:**
 * Call the Myriad quote API with your trade parameters. The response includes
 * `sharesThreshold` which accounts for slippage protection.
 *
 * @returns Array with single sell transaction call
 */
export function buildSellTransaction(params: BuildSellParams): TransactionCall[] {
  const {
    marketId,
    outcomeId,
    value,
    maxShares,
    tokenDecimals,
    predictionMarketAddress,
    referralCode = "",
  } = params;

  // Convert human-readable amounts to contract decimals
  const valueInDecimals = parseUnits(value.toString(), tokenDecimals);
  const maxSharesInDecimals = parseUnits(maxShares.toString(), tokenDecimals);

  const sellData = encodeFunctionData({
    abi: PREDICTION_MARKET_ABI,
    functionName: "referralSell",
    args: [
      BigInt(marketId),
      BigInt(outcomeId),
      valueInDecimals,
      maxSharesInDecimals, // Slippage protection: revert if more shares needed
      referralCode,
    ],
  });

  return [
    {
      to: predictionMarketAddress,
      data: sellData,
    },
  ];
}

/**
 * Builds transaction calls for a trade (buy or sell).
 *
 * Convenience function that dispatches to buildBuyTransaction or
 * buildSellTransaction based on the action parameter.
 */
export function buildTradeTransaction(params: {
  action: "buy" | "sell";
  marketId: number;
  outcomeId: number;
  value: number;
  sharesThreshold: number;
  tokenAddress: Hex;
  tokenDecimals: number;
  predictionMarketAddress: Hex;
  referralCode?: string;
}): TransactionCall[] {
  const {
    action,
    marketId,
    outcomeId,
    value,
    sharesThreshold,
    tokenAddress,
    tokenDecimals,
    predictionMarketAddress,
    referralCode,
  } = params;

  if (action === "buy") {
    return buildBuyTransaction({
      marketId,
      outcomeId,
      value,
      minShares: sharesThreshold,
      tokenAddress,
      tokenDecimals,
      predictionMarketAddress,
      referralCode,
    });
  } else {
    return buildSellTransaction({
      marketId,
      outcomeId,
      value,
      maxShares: sharesThreshold,
      tokenDecimals,
      predictionMarketAddress,
      referralCode,
    });
  }
}

