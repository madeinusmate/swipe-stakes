"use client";

/**
 * Portfolio Page - Swipe Design
 *
 * Redesigned profile page matching the Tinder-style swipe aesthetic.
 * Full-screen dark theme with modern card-based layout.
 */

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Clock,
  ChevronRight,
  Loader2,
  ShoppingCart,
  Banknote,
  Settings,
  Zap,
  LogOut,
  Hand,
  MousePointerClick,
} from "lucide-react";
import { useNetwork } from "@/lib/network-context";
import { useBetSettings } from "@/lib/bet-settings-context";
import { portfolioQueryOptions, userEventsInfiniteQueryOptions, abstractProfileQueryOptions } from "@/lib/queries";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGate } from "@/components/swipe";
import { USE_MOCK_DATA } from "@/lib/config";
import type { Position, MarketEvent } from "@/lib/types";
import { format } from "date-fns";
import { AuroraBackground } from "@/components/ui/aurora-background";

// =============================================================================
// Position Card Component
// =============================================================================

const PositionCard = ({ position }: { position: Position }) => {
  const isProfitable = position.profit >= 0;
  const isYes = position.outcomeTitle?.toLowerCase() === "yes";

  return (
    <Link
      href={`/markets/${position.marketSlug}`}
      className="block"
    >
      <div className="relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all group">
        {/* Profit indicator bar */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            isProfitable ? "bg-emerald-500" : "bg-rose-500"
          )}
        />

        <div className="p-4 pl-5">
          <div className="flex gap-4">
            {/* Market Image */}
            <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-white/5">
              {position.imageUrl ? (
                <Image
                  src={position.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white/20" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 mb-2 group-hover:text-white/90">
                {position.marketTitle}
              </h3>

              <div className="flex items-center gap-3">
                {/* Outcome Badge */}
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs font-bold uppercase",
                    isYes
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  )}
                >
                  {position.outcomeTitle}
                </span>

                {/* Shares */}
                <span className="text-xs text-white/50">
                  {position.shares.toFixed(1)} shares
                </span>
              </div>
            </div>

            {/* Value & P&L */}
            <div className="flex flex-col items-end justify-center shrink-0">
              <span className="text-lg font-bold text-white tabular-nums">
                {formatCurrency(position.value)}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  isProfitable ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {isProfitable ? "+" : ""}
                {formatCurrency(position.profit)}
              </span>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
    </Link>
  );
};

// =============================================================================
// Activity Item Component
// =============================================================================

const ActivityItem = ({ event }: { event: MarketEvent }) => {
  const isBuy = event.action === "buy";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
      {/* Action Icon */}
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
          isBuy ? "bg-emerald-500/20" : "bg-rose-500/20"
        )}
      >
        {isBuy ? (
          <ShoppingCart className="h-5 w-5 text-emerald-400" />
        ) : (
          <Banknote className="h-5 w-5 text-rose-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {event.marketTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              "text-xs font-semibold uppercase",
              isBuy ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {event.action}
          </span>
          <span className="text-xs text-white/50">
            {event.shares.toFixed(1)} shares
          </span>
        </div>
      </div>

      {/* Value & Date */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-bold text-white tabular-nums">
          {formatCurrency(event.value)}
        </span>
        <span className="text-xs text-white/40">
          {format(new Date(event.timestamp * 1000), "MMM d")}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// Stats Card Component
// =============================================================================

const StatsCard = ({
  label,
  value,
  icon: Icon,
  color = "default",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: "default" | "green" | "red";
}) => (
  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-2 mb-2">
      <Icon
        className={cn(
          "h-4 w-4",
          color === "green" && "text-emerald-400",
          color === "red" && "text-rose-400",
          color === "default" && "text-white/50"
        )}
      />
      <span className="text-xs text-white/50 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
    <p
      className={cn(
        "text-xl font-bold tabular-nums",
        color === "green" && "text-emerald-400",
        color === "red" && "text-rose-400",
        color === "default" && "text-white"
      )}
    >
      {value}
    </p>
  </div>
);

// =============================================================================
// Page Component
// =============================================================================

// =============================================================================
// Quick Bet Settings Component
// =============================================================================

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

const QuickBetSettings = () => {
  const { quickBetAmount, setQuickBetAmount } = useBetSettings();
  const [inputValue, setInputValue] = useState(quickBetAmount.toString());

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 1000) {
      setQuickBetAmount(parsed);
    }
  };

  const handlePresetClick = (amount: number) => {
    setInputValue(amount.toString());
    setQuickBetAmount(amount);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Quick Bet Amount</h3>
          <p className="text-xs text-white/50">Default amount for swipe bets</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">
          $
        </span>
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          min="1"
          max="1000"
          step="1"
          className="pl-8 h-14 text-xl font-bold bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          placeholder="5"
        />
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={cn(
              "py-3 rounded-xl font-bold text-sm transition-all",
              quickBetAmount === amount
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Info Text */}
      <p className="text-xs text-white/40 text-center">
        This amount will be used when you tap Yes/No on market cards
      </p>
    </div>
  );
};

// =============================================================================
// Interaction Mode Settings Component
// =============================================================================

const InteractionModeSettings = () => {
  const { interactionMode, setInteractionMode } = useBetSettings();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Hand className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Interaction Mode</h3>
          <p className="text-xs text-white/50">How you place bets on cards</p>
        </div>
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setInteractionMode("tap")}
          className={cn(
            "relative p-4 rounded-2xl border transition-all text-left",
            interactionMode === "tap"
              ? "bg-violet-500/20 border-violet-500/50 shadow-lg shadow-violet-500/10"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className={cn(
              "h-5 w-5",
              interactionMode === "tap" ? "text-violet-400" : "text-white/50"
            )} />
            <span className={cn(
              "font-bold text-sm",
              interactionMode === "tap" ? "text-violet-400" : "text-white/70"
            )}>
              Tap Mode
            </span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Swipe to browse cards. Tap Yes/No buttons to bet.
          </p>
          {interactionMode === "tap" && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-violet-400" />
          )}
        </button>

        <button
          onClick={() => setInteractionMode("swipe")}
          className={cn(
            "relative p-4 rounded-2xl border transition-all text-left",
            interactionMode === "swipe"
              ? "bg-violet-500/20 border-violet-500/50 shadow-lg shadow-violet-500/10"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Hand className={cn(
              "h-5 w-5",
              interactionMode === "swipe" ? "text-violet-400" : "text-white/50"
            )} />
            <span className={cn(
              "font-bold text-sm",
              interactionMode === "swipe" ? "text-violet-400" : "text-white/70"
            )}>
              Swipe Mode
            </span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Swipe right for Yes, left for No. Tap Skip to pass.
          </p>
          {interactionMode === "swipe" && (
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-violet-400" />
          )}
        </button>
      </div>

      {/* Visual Hint */}
      <div className={cn(
        "p-3 rounded-xl border text-center text-sm",
        interactionMode === "tap" 
          ? "bg-white/5 border-white/10 text-white/50"
          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      )}>
        {interactionMode === "tap" ? (
          <>👆 Tap the Yes/No buttons to place bets</>
        ) : (
          <>👉 Swipe right = Yes &nbsp;•&nbsp; 👈 Swipe left = No</>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Page Component
// =============================================================================

export default function PortfolioPage() {
  const { status, address } = useAccount();
  const { disconnect } = useDisconnect();
  const isConnected = status === "connected";
  const { apiBaseUrl, networkConfig } = useNetwork();
  const [activeTab, setActiveTab] = useState<"positions" | "activity">("positions");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch profile
  const { data: profile } = useQuery(abstractProfileQueryOptions(address));

  // Fetch portfolio
  const { data: portfolioData, isPending: isPortfolioPending } = useQuery({
    ...portfolioQueryOptions(apiBaseUrl, address ?? "", {
      networkId: networkConfig.id,
    }),
    enabled: Boolean(address) || USE_MOCK_DATA,
  });

  // Fetch activity
  const { data: activityData, isPending: isActivityPending } = useInfiniteQuery({
    ...userEventsInfiniteQueryOptions(apiBaseUrl, address ?? "", {
      networkId: networkConfig.id,
    }),
    enabled: Boolean(address) || USE_MOCK_DATA,
  });

  // Show auth gate if not connected and not using mock data
  if (!isConnected && !USE_MOCK_DATA) {
    return <AuthGate />;
  }

  const positions = portfolioData?.data ?? [];
  const events = activityData?.pages.flatMap((page) => page.data) ?? [];

  // Calculate stats
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0);
  const totalInvested = positions.reduce((sum, p) => sum + (p.invested ?? p.value - p.profit), 0);
  const isProfitable = totalProfit >= 0;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <AuroraBackground/>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </Link>

        <h1 className="text-lg font-bold text-white">Profile</h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <Settings className="h-5 w-5 text-white/70" />
        </Button>
      </header>

      {/* Content */}
      <div className="h-full overflow-y-auto pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center pt-4">
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-violet-500 rounded-full opacity-50 blur-md" />
              <Avatar className="h-24 w-24 border-2 border-zinc-900 relative">
                {profile?.profilePictureUrl && (
                  <AvatarImage src={profile.profilePictureUrl} alt="Profile" />
                )}
                {address && (
                  <AvatarImage src={`https://avatar.vercel.sh/${address}`} alt="Profile" />
                )}
                <AvatarFallback className="bg-zinc-800 text-white text-2xl">
                  {address?.slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">
              {profile?.name || "Abstract User"}
            </h2>
            <p className="text-sm text-white/50 font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              label="Portfolio Value"
              value={formatCurrency(totalValue)}
              icon={Wallet}
            />
            <StatsCard
              label="Total P&L"
              value={`${isProfitable ? "+" : ""}${formatCurrency(totalProfit)}`}
              icon={isProfitable ? TrendingUp : TrendingDown}
              color={isProfitable ? "green" : "red"}
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab("positions")}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === "positions"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              Positions
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === "activity"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              Activity
            </button>
          </div>

          {/* Positions Tab */}
          {activeTab === "positions" && (
            <div className="space-y-3">
              {isPortfolioPending ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                </div>
              ) : positions.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 font-medium mb-2">No positions yet</p>
                  <p className="text-white/40 text-sm mb-6">
                    Start trading to build your portfolio
                  </p>
                  <Link href="/">
                    <Button className="bg-white text-zinc-900 hover:bg-white/90">
                      Browse Markets
                      </Button>
                  </Link>
                </div>
              ) : (
                positions.map((position) => (
                  <PositionCard
                    key={`${position.marketId}-${position.outcomeId}`}
                    position={position}
                  />
                ))
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {isActivityPending ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-white/50 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 font-medium mb-2">No activity yet</p>
                  <p className="text-white/40 text-sm">
                    Your trading history will appear here
                  </p>
                </div>
              ) : (
                events.map((event, idx) => (
                  <ActivityItem
                    key={`${event.marketId}-${event.timestamp}-${idx}`}
                    event={event}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* Settings Slide-out Panel */}
      <div
        className={cn(
          "fixed inset-0 z-[200] transition-opacity duration-300",
          isSettingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out",
            isSettingsOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(false)}
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white/70" />
            </Button>
          </div>

          {/* Panel Content */}
          <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <InteractionModeSettings />
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <QuickBetSettings />
            </div>

            {/* Logout Section */}
            {isConnected && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    disconnect();
                    setIsSettingsOpen(false);
                  }}
                  className="w-full py-4 rounded-2xl font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
