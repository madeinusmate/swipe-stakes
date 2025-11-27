/**
 * Myriad Contract Interactions
 *
 * This module provides pure, framework-agnostic functions for building
 * transactions to interact with Myriad prediction market contracts.
 *
 * **Quick Start:**
 *
 * ```ts
 * import {
 *   buildBuyTransaction,
 *   buildSellTransaction,
 *   buildClaimWinningsTransaction,
 * } from "@/lib/contracts";
 * ```
 *
 * **Architecture:**
 *
 * These functions return transaction call objects that can be sent using
 * any wallet library (wagmi, viem, ethers, web3.js). They handle:
 *
 * - Encoding function calls with proper ABIs
 * - Converting human-readable amounts to contract decimals
 * - Building approval calls for ERC20 tokens
 *
 * **Typical Flow:**
 *
 * 1. Fetch a quote from Myriad API to get expected shares/slippage
 * 2. Build transaction calls using these functions
 * 3. Send calls using your wallet library of choice
 * 4. Monitor transaction status and handle confirmations
 *
 * @module contracts
 */

// =============================================================================
// Trade Functions
// =============================================================================

export {
  // Core builders
  buildBuyTransaction,
  buildSellTransaction,
  buildTradeTransaction,
  // Types
  type TransactionCall,
  type BuildBuyParams,
  type BuildSellParams,
} from "./trade";

// =============================================================================
// Claim Functions
// =============================================================================

export {
  // Core builders
  buildClaimWinningsTransaction,
  buildClaimVoidedTransaction,
  buildClaimTransaction,
  // Types
  type BuildClaimWinningsParams,
  type BuildClaimVoidedParams,
  type BuildClaimParams,
} from "./claim";

