/**
 * Contract ABIs for Myriad Protocol
 *
 * This file contains the Application Binary Interfaces (ABIs) for interacting
 * with Myriad smart contracts on Abstract chain.
 *
 * These ABIs define the function signatures needed to:
 * - Approve tokens for trading (ERC20)
 * - Buy and sell outcome shares (Prediction Market)
 * - Claim winnings from resolved markets (Prediction Market)
 *
 * @see https://docs.myriadprotocol.com for full protocol documentation
 */

// =============================================================================
// ERC20 Token ABI
// =============================================================================

/**
 * Standard ERC20 ABI for token approvals.
 *
 * Before buying shares, users must approve the Prediction Market contract
 * to spend their tokens. This is a one-time approval per token.
 */
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

// =============================================================================
// Prediction Market ABI
// =============================================================================

/**
 * Myriad Prediction Market contract ABI.
 *
 * Core functions for trading and claiming:
 *
 * **Trading Functions:**
 * - `referralBuy`: Purchase outcome shares with referral tracking
 * - `referralSell`: Sell outcome shares with referral tracking
 *
 * **Claim Functions:**
 * - `claimWinnings`: Claim tokens from winning positions after market resolution
 * - `claimVoidedOutcomeShares`: Reclaim tokens from voided/cancelled markets
 */
export const PREDICTION_MARKET_ABI = [
  // =========================================================================
  // Trading Functions
  // =========================================================================

  /**
   * Buy outcome shares with referral tracking.
   *
   * @param marketId - On-chain market ID
   * @param outcomeId - Outcome to buy (e.g., 0 for "Yes", 1 for "No")
   * @param minOutcomeSharesToBuy - Minimum shares to receive (slippage protection)
   * @param value - Amount of tokens to spend
   * @param code - Referral code for revenue sharing (can be empty string)
   */
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

  /**
   * Sell outcome shares with referral tracking.
   *
   * @param marketId - On-chain market ID
   * @param outcomeId - Outcome to sell
   * @param value - Amount of tokens to receive
   * @param maxOutcomeSharesToSell - Maximum shares to give up (slippage protection)
   * @param code - Referral code for revenue sharing (can be empty string)
   */
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

  // =========================================================================
  // Claim Functions
  // =========================================================================

  /**
   * Claim winnings from a resolved market.
   *
   * Call this after a market resolves if you hold winning outcome shares.
   * Each winning share is worth 1 token (minus any fees).
   *
   * @param marketId - On-chain market ID
   */
  {
    name: "claimWinnings",
    type: "function",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },

  /**
   * Reclaim tokens from a voided/cancelled market.
   *
   * If a market is voided (cancelled), all shares are redeemable at their
   * original purchase price. Call this for each outcome you hold shares in.
   *
   * @param marketId - On-chain market ID
   * @param outcomeId - Outcome ID to claim voided shares for
   */
  {
    name: "claimVoidedOutcomeShares",
    type: "function",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "outcomeId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// =============================================================================
// Type Exports
// =============================================================================

export type ERC20Abi = typeof ERC20_ABI;
export type PredictionMarketAbi = typeof PREDICTION_MARKET_ABI;

