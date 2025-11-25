"use client";

/**
 * Market Filters Component
 *
 * Search and filter controls for the markets list.
 * Includes:
 * - Keyword search
 * - State filter (open/closed/resolved)
 * - Sort options
 */

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { MarketsQueryParams } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface MarketFiltersValue {
  keyword?: string;
  state?: "open" | "closed" | "resolved";
  sort?: MarketsQueryParams["sort"];
}

interface MarketFiltersProps {
  value: MarketFiltersValue;
  onChange: (value: MarketFiltersValue) => void;
}

// =============================================================================
// Component
// =============================================================================

export function MarketFilters({ value, onChange }: MarketFiltersProps) {
  // Local state for keyword input (debounced)
  const [keywordInput, setKeywordInput] = useState(value.keyword ?? "");

  // Handle keyword search with debounce
  const handleKeywordChange = useCallback(
    (newKeyword: string) => {
      setKeywordInput(newKeyword);
      // Simple debounce: update parent after typing stops
      const timeoutId = setTimeout(() => {
        onChange({ ...value, keyword: newKeyword || undefined });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [onChange, value]
  );

  const handleStateChange = useCallback(
    (newState: string) => {
      onChange({
        ...value,
        state: newState === "all" ? undefined : (newState as MarketFiltersValue["state"]),
      });
    },
    [onChange, value]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      onChange({ ...value, sort: newSort as MarketFiltersValue["sort"] });
    },
    [onChange, value]
  );

  const clearFilters = useCallback(() => {
    setKeywordInput("");
    onChange({});
  }, [onChange]);

  const hasFilters = value.keyword || value.state || value.sort;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search markets..."
          value={keywordInput}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* State Filter */}
        <Select value={value.state ?? "all"} onValueChange={handleStateChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={value.sort ?? "volume"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volume">Total Volume</SelectItem>
            <SelectItem value="volume_24h">24h Volume</SelectItem>
            <SelectItem value="liquidity">Liquidity</SelectItem>
            <SelectItem value="expires_at">Expiry Date</SelectItem>
            <SelectItem value="published_at">Newest</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

