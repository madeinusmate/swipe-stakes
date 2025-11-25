"use client";

/**
 * Markets Page
 *
 * Main landing page displaying all available prediction markets.
 * Features:
 * - Search and filter markets
 * - Sort by volume, liquidity, etc.
 * - Paginated grid of market cards
 */

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "@/lib/network-context";
import { marketsQueryOptions } from "@/lib/queries";
import { MarketFilters, type MarketFiltersValue } from "@/components/markets/market-filters";
import { MarketList } from "@/components/markets/market-list";
import type { MarketSummary } from "@/lib/types";

// =============================================================================
// Page Component
// =============================================================================

export default function MarketsPage() {
  const { apiBaseUrl, networkConfig, isTestnet } = useNetwork();

  // Filter state
  const [filters, setFilters] = useState<MarketFiltersValue>({
    sort: "volume_24h",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [allMarkets, setAllMarkets] = useState<MarketSummary[]>([]);

  // Fetch markets with current filters
  const { data, isPending, isFetching } = useQuery({
    ...marketsQueryOptions(apiBaseUrl, {
      page,
      limit: 12,
      networkId: networkConfig.id,
      keyword: filters.keyword,
      state: filters.state,
      sort: filters.sort,
      order: "desc",
    }),
    // Reset markets when filters change
    placeholderData: (previousData) => previousData,
  });

  // Handle filter changes - reset pagination
  const handleFiltersChange = useCallback((newFilters: MarketFiltersValue) => {
    setFilters(newFilters);
    setPage(1);
    setAllMarkets([]);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (data?.pagination.hasNext) {
      setPage((p) => p + 1);
    }
  }, [data?.pagination.hasNext]);

  // Combine paginated results
  const markets = page === 1 ? (data?.data ?? []) : [...allMarkets, ...(data?.data ?? [])];

  // Update allMarkets when new data arrives
  if (data?.data && page > 1 && !allMarkets.includes(data.data[0])) {
    setAllMarkets((prev) => [...prev, ...data.data]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prediction Markets</h1>
        <p className="mt-2 text-muted-foreground">
          Trade on the outcomes of real-world events on{" "}
          <span className="font-medium text-foreground">{networkConfig.name}</span>
          {isTestnet && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">(Testnet)</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MarketFilters value={filters} onChange={handleFiltersChange} />
      </div>

      {/* Market List */}
      <MarketList
        markets={markets}
        pagination={data?.pagination}
        isLoading={isPending && page === 1}
        onLoadMore={handleLoadMore}
        isLoadingMore={isFetching && page > 1}
      />
    </div>
  );
}
