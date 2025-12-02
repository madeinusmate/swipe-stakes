"use client";

/**
 * Swipe Header Component
 *
 * Minimal floating header for the swipe UI with:
 * - Left: Profile icon (links to /portfolio)
 * - Right: Filter dropdown (categories + sort)
 */

import Link from "next/link";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { User, SlidersHorizontal, Flame, Clock, TrendingUp, Check, Funnel } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { abstractProfileQueryOptions } from "@/lib/queries";

// =============================================================================
// Types
// =============================================================================

export interface SwipeFilters {
  sort: "volume_24h" | "volume" | "published_at";
  topics?: string;
}

interface SwipeHeaderProps {
  filters: SwipeFilters;
  onFiltersChange: (filters: SwipeFilters) => void;
}

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "crypto", label: "Crypto" },
  { value: "sports", label: "Sports" },
  { value: "politics", label: "Politics" },
  { value: "technology", label: "Technology" },
  { value: "economics", label: "Economics" },
  { value: "stocks", label: "Stocks" },
];

const SORT_OPTIONS = [
  { value: "volume_24h", label: "Hot", icon: Flame },
  { value: "published_at", label: "New", icon: Clock },
  { value: "volume", label: "Popular", icon: TrendingUp },
] as const;

// =============================================================================
// Component
// =============================================================================

export const SwipeHeader = ({ filters, onFiltersChange }: SwipeHeaderProps) => {
  const { address } = useAccount();
  const { data: profile } = useQuery(abstractProfileQueryOptions(address));

  const currentSort = SORT_OPTIONS.find((s) => s.value === filters.sort) || SORT_OPTIONS[0];
  const currentCategory = CATEGORIES.find((c) => c.value === (filters.topics || "all")) || CATEGORIES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
      {/* Profile Button - Left */}
      <Link href="/portfolio" className="pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all"
        >
          <Avatar className="h-9 w-9">
            {profile?.profilePictureUrl && (
              <AvatarImage src={profile.profilePictureUrl} alt="Profile" />
            )}
            {address ? (
              <AvatarImage src={`https://avatar.vercel.sh/${address}`} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-white/10">
                <User className="h-5 w-5 text-white/70" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </Link>

      {/* Filter Button - Right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all"
          >
            <Funnel className="h-5 w-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-xl border-white/10 z-[200]">
          {/* Sort Section */}
          <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">
            Sort By
          </DropdownMenuLabel>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onFiltersChange({ ...filters, sort: option.value })}
              className="flex items-center justify-between cursor-pointer text-white hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <option.icon className="h-4 w-4 text-white/70" />
                {option.label}
              </span>
              {filters.sort === option.value && (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Category Section */}
          <DropdownMenuLabel className="text-xs text-white/50 uppercase tracking-wider">
            Category
          </DropdownMenuLabel>
          {CATEGORIES.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  topics: category.value === "all" ? undefined : category.value,
                })
              }
              className="flex items-center justify-between cursor-pointer text-white hover:bg-white/10"
            >
              {category.label}
              {(filters.topics || "all") === category.value && (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

