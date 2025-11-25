/**
 * Portfolio Query Options
 *
 * TanStack Query options for fetching user portfolio data.
 * Portfolio queries require a connected wallet address.
 *
 * @example
 * ```tsx
 * const { address } = useAccount();
 * const { data } = useQuery(portfolioQueryOptions(apiBaseUrl, address!, { networkId: 2741 }));
 * ```
 */

import { queryOptions } from "@tanstack/react-query";
import { getUserPortfolio } from "@/lib/myriad-api";
import type { PortfolioQueryParams } from "@/lib/types";

// =============================================================================
// Query Keys
// =============================================================================

/**
 * Query key factory for portfolio queries.
 */
export const portfolioKeys = {
  /** Base key for all portfolio queries */
  all: ["portfolio"] as const,
  /** Key for a user's portfolio */
  user: (baseUrl: string, address: string) => [...portfolioKeys.all, baseUrl, address] as const,
  /** Key for filtered portfolio query */
  filtered: (baseUrl: string, address: string, params: PortfolioQueryParams) =>
    [...portfolioKeys.user(baseUrl, address), params] as const,
};

// =============================================================================
// Query Options
// =============================================================================

/**
 * Query options for fetching a user's portfolio positions.
 *
 * @param baseUrl - API base URL
 * @param address - User's wallet address
 * @param params - Filter parameters (networkId, tokenAddress, etc.)
 *
 * @example
 * ```tsx
 * function Portfolio() {
 *   const { apiBaseUrl, networkConfig } = useNetwork();
 *   const { address } = useAccount();
 *
 *   const { data, isPending } = useQuery(
 *     portfolioQueryOptions(apiBaseUrl, address!, {
 *       networkId: networkConfig.id,
 *     })
 *   );
 *
 *   if (!address) return <ConnectWalletPrompt />;
 *   if (isPending) return <Skeleton />;
 *
 *   return <PositionsList positions={data.data} />;
 * }
 * ```
 */
export function portfolioQueryOptions(
  baseUrl: string,
  address: string,
  params: PortfolioQueryParams = {}
) {
  return queryOptions({
    queryKey: portfolioKeys.filtered(baseUrl, address, params),
    queryFn: () => getUserPortfolio(baseUrl, address, params),
    // Portfolio data changes with trades, keep it fresh
    staleTime: 15 * 1000,
    // Refetch on window focus to catch external changes
    refetchOnWindowFocus: true,
    // Only fetch when we have both baseUrl and address
    enabled: Boolean(baseUrl && address),
  });
}

