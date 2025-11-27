/**
 * Portfolio Query Options
 *
 * TanStack Query options for fetching user portfolio data.
 * Portfolio queries require a connected wallet address.
 */

import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { getUserPortfolio, getUserEvents } from "@/lib/myriad-api";
import type { PortfolioQueryParams, UserEventsQueryParams } from "@/lib/types";

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
  /** Key for user events */
  events: (baseUrl: string, address: string, params: UserEventsQueryParams) =>
    [...portfolioKeys.user(baseUrl, address), "events", params] as const,
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

/**
 * Query options for fetching a user's activity feed (infinite scroll).
 *
 * @param baseUrl - API base URL
 * @param address - User's wallet address
 * @param params - Filter parameters
 */
export function userEventsInfiniteQueryOptions(
  baseUrl: string,
  address: string,
  params: UserEventsQueryParams = {}
) {
  return infiniteQueryOptions({
    queryKey: portfolioKeys.events(baseUrl, address, { ...params, page: undefined }),
    queryFn: ({ pageParam }) => getUserEvents(baseUrl, address, { ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined;
    },
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
    enabled: Boolean(baseUrl && address),
  });
}

