"use client";

/**
 * Swipe Card Component
 *
 * Full-screen market card with:
 * - Market image and title
 * - Probability bar
 * - Yes/No quick bet buttons
 * - Flip animation to reveal market details
 */

import { useState } from "react";
import Image from "next/image";
import { Info, Clock, TrendingUp, BarChart3, ChevronLeft, SkipForward, SkipBack, Rewind } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompact, formatTimeRemaining, formatPricePercent } from "@/lib/formatters";
import { sortBinaryOutcomes } from "@/lib/outcome-colors";
import { useBetSettings, type InteractionMode } from "@/lib/bet-settings-context";
import type { MarketSummary } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

interface SwipeCardProps {
  market: MarketSummary;
  onBet: (market: MarketSummary, outcomeId: number) => void;
  onSkip?: () => void;
  onRewind?: () => void;
  isPending?: boolean;
  dragX?: number;
}

// =============================================================================
// Card Front Component
// =============================================================================

interface CardFrontProps {
  market: MarketSummary;
  onBet: (outcomeId: number) => void;
  onSkip?: () => void;
  onRewind?: () => void;
  onFlip: () => void;
  isPending?: boolean;
  dragX?: number;
  quickBetAmount: number;
  interactionMode: InteractionMode;
}

const CardFront = ({ market, onBet, onSkip, onRewind, onFlip, isPending, dragX = 0, quickBetAmount, interactionMode }: CardFrontProps) => {
  const orderedOutcomes = sortBinaryOutcomes(market.outcomes);
  const [yesOutcome, noOutcome] = orderedOutcomes;

  // Calculate overlay opacity based on drag
  const yesOverlayOpacity = Math.min(Math.max(dragX / 150, 0), 0.4);
  const noOverlayOpacity = Math.min(Math.max(-dragX / 150, 0), 0.4);

  return (
    <div className="relative h-full w-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        {market.imageUrl ? (
          <>
            <Image
              src={market.imageUrl}
              alt={market.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <BarChart3 className="h-24 w-24 text-white/10" />
          </div>
        )}
      </div>

      {/* Swipe direction overlays */}
      <div
        className="absolute inset-0 bg-emerald-500/20 pointer-events-none transition-opacity z-10"
        style={{ opacity: yesOverlayOpacity }}
      />
      <div
        className="absolute inset-0 bg-rose-500/20 pointer-events-none transition-opacity z-10"
        style={{ opacity: noOverlayOpacity }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 z-20">

        {interactionMode === "tap" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRewind?.();
            }}
            className="absolute top-6 left-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors pointer-events-auto z-30"
          >
            <SkipBack className="h-5 w-5 text-white" />
          </button>
        )}
        {/* Info Button */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors pointer-events-auto z-30"
        >
          <Info className="h-5 w-5 text-white" />
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4 line-clamp-3">
          {market.title}
        </h2>
        {/* Category Badge */}
        {market.topics.length > 0 && (
          <div className="relative mb-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white/90 border border-white/10">
              {market.topics[0]}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-6 text-sm text-white/70">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>{formatCompact(market.volume24h)} Vol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatTimeRemaining(market.expiresAt)}</span>
          </div>
        </div>

        {/* Probability Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-bold mb-2">
            <span className="text-rose-400">{formatPricePercent(noOutcome.price, 0)}</span>
            <span className="text-emerald-400">{formatPricePercent(yesOutcome.price, 0)}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-rose-400"
              style={{ width: `${noOutcome.price * 100}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-emerald-500 to-emerald-400"
              style={{ width: `${yesOutcome.price * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons - conditional based on mode */}
        <div className="pointer-events-auto">
          {interactionMode === "tap" ? (

            /* Tap Mode: Yes/No Buttons with Back option */
            <div className="space-y-3">


              {/* Yes/No Buttons */}
              <div className="grid grid-cols-2 gap-3">
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBet(noOutcome.id);
                  }}
                  disabled={isPending}
                  className={cn(
                    "relative py-4 rounded-2xl font-bold text-lg uppercase tracking-wide transition-all",
                    "bg-rose-500 text-white shadow-lg shadow-rose-500/25",
                    "hover:bg-rose-400 hover:shadow-rose-500/40 hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  <span className="block">No</span>
                  <span className="block text-xs font-medium opacity-80 mt-0.5">
                    ${quickBetAmount}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBet(yesOutcome.id);
                  }}
                  disabled={isPending}
                  className={cn(
                    "relative py-4 rounded-2xl font-bold text-lg uppercase tracking-wide transition-all",
                    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
                    "hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  <span className="block">Yes</span>
                  <span className="block text-xs font-medium opacity-80 mt-0.5">
                    ${quickBetAmount}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Swipe Mode: Rewind and Skip Buttons */
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRewind?.();
                }}
                className={cn(
                  "py-4 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all",
                  "bg-white/10 text-white border border-white/20",
                  "hover:bg-white/20 hover:border-white/30 hover:scale-[1.01]",
                  "active:scale-[0.99]",
                  "flex items-center justify-center gap-2"
                )}
              >
                <SkipBack className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSkip?.();
                }}
                className={cn(
                  "py-4 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all",
                  "bg-white/10 text-white border border-white/20",
                  "hover:bg-white/20 hover:border-white/30 hover:scale-[1.01]",
                  "active:scale-[0.99]",
                  "flex items-center justify-center gap-2"
                )}
              >
                <span>Skip</span>
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Card Back Component (Details)
// =============================================================================

interface CardBackProps {
  market: MarketSummary;
  onFlip: () => void;
}

const CardBack = ({ market, onFlip }: CardBackProps) => {
  const orderedOutcomes = sortBinaryOutcomes(market.outcomes);

  return (
    <div className="relative h-full w-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <h3 className="font-semibold text-white truncate flex-1">Market Details</h3>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-white leading-tight mb-2">
            {market.title}
          </h2>
          {market.topics.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {market.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
            Resolution Criteria
          </h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {market.description}
          </p>
        </div>

        {/* Outcomes */}
        <div>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Outcomes
          </h4>
          <div className="space-y-2">
            {orderedOutcomes.map((outcome, index) => (
              <div
                key={outcome.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl",
                  index === 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
                )}
              >
                <span className={cn(
                  "font-semibold",
                  index === 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {outcome.title}
                </span>
                <span className={cn(
                  "font-bold text-lg",
                  index === 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {formatPricePercent(outcome.price, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Market Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">24h Volume</div>
              <div className="text-lg font-bold text-white">
                {formatCompact(market.volume24h)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Total Volume</div>
              <div className="text-lg font-bold text-white">
                {formatCompact(market.volume)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Liquidity</div>
              <div className="text-lg font-bold text-white">
                {formatCompact(market.liquidity)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Expires</div>
              <div className="text-lg font-bold text-white">
                {formatTimeRemaining(market.expiresAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const SwipeCard = ({ market, onBet, onSkip, onRewind, isPending, dragX }: SwipeCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { quickBetAmount, interactionMode } = useBetSettings();

  const handleFlip = () => setIsFlipped((prev) => !prev);
  const handleBet = (outcomeId: number) => onBet(market, outcomeId);

  return (
    <div
      className="relative w-[calc(100vw-32px)] max-w-[420px] h-[calc(100dvh-140px)] max-h-[700px]"
      style={{
        perspective: "1500px",
        perspectiveOrigin: "center center",
      }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <CardFront
            market={market}
            onBet={handleBet}
            onSkip={onSkip}
            onRewind={onRewind}
            onFlip={handleFlip}
            isPending={isPending}
            dragX={dragX}
            quickBetAmount={quickBetAmount}
            interactionMode={interactionMode}
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardBack market={market} onFlip={handleFlip} />
        </div>
      </div>
    </div>
  );
};

