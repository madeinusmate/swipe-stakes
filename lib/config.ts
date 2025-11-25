/**
 * Myriad Starter Kit Configuration
 *
 * This file contains all network configurations, contract addresses, and API settings.
 * Myriad is deployed on Abstract (and other chains), but this starter kit focuses on Abstract.
 *
 * CUSTOMIZE: Update these values when deploying to production or adding new networks.
 */

// =============================================================================
// Network Configuration
// =============================================================================

export const NETWORKS = {
  /** Abstract Mainnet - Production environment */
  mainnet: {
    id: 2741,
    name: "Abstract",
    rpcUrl: "https://api.mainnet.abs.xyz",
    blockExplorer: "https://abscan.org",
  },
  /** Abstract Testnet (Sepolia) - Development/testing environment */
  testnet: {
    id: 11124,
    name: "Abstract Testnet",
    rpcUrl: "https://api.testnet.abs.xyz",
    blockExplorer: "https://sepolia.abscan.org",
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

// =============================================================================
// Contract Addresses
// =============================================================================

/**
 * Myriad Protocol smart contract addresses on Abstract.
 * These contracts handle all prediction market logic on-chain.
 */
export const CONTRACTS = {
  mainnet: {
    /** Main prediction market contract - handles market creation, trading, resolution */
    predictionMarket: "0x3e0F5F8F5Fb043aBFA475C0308417Bf72c463289" as const,
    /** Read-only querier contract - batch fetches market data efficiently */
    predictionMarketQuerier: "0x1d5773Cd0dC74744C1F7a19afEeECfFE64f233Ff" as const,
  },
  testnet: {
    predictionMarket: "0x6c44Abf72085E5e71EeB7C951E3079073B1E7312" as const,
    predictionMarketQuerier: "0xa30c60107f9011dd49fc9e04ebe15963064eecc1" as const,
  },
} as const;

// =============================================================================
// Token Addresses
// =============================================================================

/**
 * ERC20 tokens supported for trading on Myriad.
 * Markets can be denominated in different tokens (USDC, PENGU, PTS).
 */
export const TOKENS = {
  mainnet: {
    /** USDC.e - Primary stablecoin for trading */
    USDC: {
      address: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1" as const,
      decimals: 6,
      symbol: "USDC.e",
    },
    /** PENGU - Pudgy Penguins token */
    PENGU: {
      address: "0x9eBe3A824Ca958e4b3Da772D2065518F009CBa62" as const,
      decimals: 18,
      symbol: "PENGU",
    },
    /** PTS - Myriad Points token */
    PTS: {
      address: "0x0b07cf011b6e2b7e0803b892d97f751659940f23" as const,
      decimals: 18,
      symbol: "PTS",
    },
  },
  testnet: {
    USDC: {
      address: "0x8820c84FD53663C2e2EA26e7a4c2b79dCc479765" as const,
      decimals: 6,
      symbol: "USDC",
    },
    PENGU: {
      address: "0x6ccDDCf494182a3A237ac3f33A303a57961FaF55" as const,
      decimals: 18,
      symbol: "PENGU",
    },
    PTS: {
      address: "0x6cC39C1149aed1fdbf6b11Fd60C18b96446cBc96" as const,
      decimals: 18,
      symbol: "PTS",
    },
  },
} as const;

// =============================================================================
// API Configuration
// =============================================================================

/**
 * Myriad REST API endpoints.
 * The API provides market data, quotes, and portfolio information.
 *
 * Note: All endpoints (except health) require an API key.
 * Set NEXT_PUBLIC_MYRIAD_API_KEY in your .env file.
 */
export const API = {
  /** Production API - use for mainnet */
  production: "https://api-v2.myriadprotocol.com",
  /** Staging API - use for testnet */
  staging: "https://api-v2.staging.myriadprotocol.com",
} as const;

/**
 * Get the appropriate API base URL for a given network.
 */
export function getApiBaseUrl(network: NetworkKey): string {
  return network === "mainnet" ? API.production : API.staging;
}

/**
 * API key for Myriad REST API.
 * CUSTOMIZE: Set this in your .env.local file
 */
export const MYRIAD_API_KEY = process.env.NEXT_PUBLIC_MYRIAD_API_KEY ?? "";

// =============================================================================
// Referral Configuration
// =============================================================================

/**
 * Referral code for revenue sharing.
 * Builders using Myriad can receive a percentage of buy volume they generate.
 *
 * To get your own referral code:
 * 1. Contact the Myriad team to request whitelisting
 * 2. Provide your referral code string and claims wallet address
 * 3. Set NEXT_PUBLIC_REFERRAL_CODE in your .env file
 *
 * @see https://docs.myriadprotocol.com - Revenue Sharing for Builders
 */
export const REFERRAL_CODE = process.env.NEXT_PUBLIC_REFERRAL_CODE ?? "";

// =============================================================================
// Default Settings
// =============================================================================

/**
 * Default network to use when none is selected.
 * CUSTOMIZE: Change to 'mainnet' for production deployments.
 */
export const DEFAULT_NETWORK: NetworkKey = "testnet";

/**
 * Default slippage tolerance for trades (0.5% = 0.005)
 */
export const DEFAULT_SLIPPAGE = 0.005;

/**
 * Items per page for paginated API responses
 */
export const DEFAULT_PAGE_SIZE = 20;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get contract addresses for a specific network.
 */
export function getContracts(network: NetworkKey) {
  return CONTRACTS[network];
}

/**
 * Get token configuration for a specific network.
 */
export function getTokens(network: NetworkKey) {
  return TOKENS[network];
}

/**
 * Get token by address for a specific network.
 */
export function getTokenByAddress(network: NetworkKey, address: string) {
  const tokens = getTokens(network);
  return Object.values(tokens).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}

