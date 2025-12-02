"use client";

/**
 * Card Stack Component
 *
 * Tinder-style swipeable card stack with:
 * - Gesture-based swipe left/right
 * - Visual depth effect with stacked cards
 * - Smooth animations for card transitions
 * - Two interaction modes: tap (swipe to browse) and swipe (swipe to bet)
 */

import { useState, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import { cn } from "@/lib/utils";
import { useBetSettings } from "@/lib/bet-settings-context";
import { sortBinaryOutcomes } from "@/lib/outcome-colors";
import type { MarketSummary } from "@/lib/types";
import { SwipeCard } from "./swipe-card";

// =============================================================================
// Types
// =============================================================================

interface CardStackProps {
  markets: MarketSummary[];
  onBet: (market: MarketSummary, outcomeId: number) => void;
  isPending?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const SWIPE_THRESHOLD = 100; // Minimum distance to trigger swipe
const ROTATION_FACTOR = 0.1; // Degrees of rotation per pixel dragged
const VISIBLE_CARDS = 3; // Number of cards visible in stack

// =============================================================================
// Component
// =============================================================================

export const CardStack = ({ markets, onBet, isPending }: CardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragState, setDragState] = useState({ x: 0, y: 0, isActive: false });
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "skip-up" | "skip-down" | "rewind-start" | "rewind-up" | "rewind-down" | null>(null);
  const { interactionMode } = useBetSettings();

  const currentMarket = markets[currentIndex];

  // Move to next card (used for skip in swipe mode) - two-phase animation:
  // 1. Card moves UP to clear the deck
  // 2. Card moves back DOWN behind the deck
  const handleSkip = useCallback(() => {
    // Phase 1: Move up
    setExitDirection("skip-up");
    
    // Phase 2: Move down behind deck
    setTimeout(() => {
      setExitDirection("skip-down");
    }, 250);
    
    // Complete: Reset and move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % markets.length);
      setExitDirection(null);
      setDragState({ x: 0, y: 0, isActive: false });
    }, 500);
  }, [markets.length]);

  // Go back to previous card (inverse of skip) - three-phase animation:
  // 1. Card starts from behind (no animation)
  // 2. Card moves UP to clear deck
  // 3. Card moves DOWN into top position
  const handleRewind = useCallback(() => {
    if (markets.length === 0) return;
    
    // Phase 1: Change index and position card behind deck (no animation)
    setCurrentIndex((prev) => (prev - 1 + markets.length) % markets.length);
    setExitDirection("rewind-start");
    
    // Phase 2: Animate UP to clear the deck (after a frame for positioning)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExitDirection("rewind-up");
      });
    });
    
    // Phase 3: Animate DOWN into position
    setTimeout(() => {
      setExitDirection("rewind-down");
    }, 300);
    
    // Complete: Reset animation state
    setTimeout(() => {
      setExitDirection(null);
      setDragState({ x: 0, y: 0, isActive: false });
    }, 550);
  }, [markets.length]);

  // Handle swipe in tap mode (just cycles cards)
  const handleSwipeTapMode = useCallback(
    (direction: "left" | "right") => {
      setExitDirection(direction);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % markets.length);
        setExitDirection(null);
        setDragState({ x: 0, y: 0, isActive: false });
      }, 300);
    },
    [markets.length]
  );

  // Handle swipe in swipe mode (triggers bets)
  const handleSwipeSwipeMode = useCallback(
    (direction: "left" | "right") => {
      if (!currentMarket) return;
      
      const orderedOutcomes = sortBinaryOutcomes(currentMarket.outcomes);
      const [yesOutcome, noOutcome] = orderedOutcomes;
      
      setExitDirection(direction);
      
      // Trigger bet based on direction
      if (direction === "right" && yesOutcome) {
        onBet(currentMarket, yesOutcome.id);
      } else if (direction === "left" && noOutcome) {
        onBet(currentMarket, noOutcome.id);
      }
      
      // Move to next card after animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % markets.length);
        setExitDirection(null);
        setDragState({ x: 0, y: 0, isActive: false });
      }, 300);
    },
    [currentMarket, markets.length, onBet]
  );

  const bind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx] }) => {
      if (isPending) return;
      
      if (active) {
        setDragState({ x: mx, y: my, isActive: true });
      } else {
        // Check if swipe threshold is met
        const shouldSwipe = Math.abs(mx) > SWIPE_THRESHOLD || (vx > 0.5 && Math.abs(mx) > 50);
        
        if (shouldSwipe) {
          const direction = mx > 0 ? "right" : "left";
          if (interactionMode === "tap") {
            handleSwipeTapMode(direction);
          } else {
            handleSwipeSwipeMode(direction);
          }
        } else {
          // Spring back
          setDragState({ x: 0, y: 0, isActive: false });
        }
      }
    },
    {
      axis: "x",
      filterTaps: true,
      rubberband: true,
    }
  );

  if (markets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-lg font-medium">No markets found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      </div>
    );
  }

  // Get visible cards (current + next few in stack)
  const visibleCards = [];
  for (let i = 0; i < VISIBLE_CARDS; i++) {
    const index = (currentIndex + i) % markets.length;
    visibleCards.push({ market: markets[index], stackIndex: i });
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Render cards in reverse order so top card is last (highest z-index) */}
      {visibleCards.reverse().map(({ market, stackIndex }) => {
        const isTop = stackIndex === 0;
        const isExiting = isTop && exitDirection !== null;

        // Calculate transforms
        let x = 0;
        let y = 0;
        let rotate = 0;
        let scale = 1 - stackIndex * 0.05;
        let translateY = stackIndex * 12;

        if (isTop && dragState.isActive) {
          x = dragState.x;
          y = dragState.y * 0.3; // Reduce vertical movement
          rotate = dragState.x * ROTATION_FACTOR;
        }

        // Handle exit/enter animations
        let zIndex = VISIBLE_CARDS - stackIndex;
        const opacity = 1;
        const isSkipping = exitDirection === "skip-up" || exitDirection === "skip-down";
        const isRewinding = exitDirection === "rewind-start" || exitDirection === "rewind-up" || exitDirection === "rewind-down";
        const isRewindStart = exitDirection === "rewind-start";

        // Card height for animations
        const cardHeight = Math.min(window.innerHeight - 140, 700);

        if (isExiting) {
          if (exitDirection === "skip-up") {
            // Skip Phase 1: Move UP to clear the deck
            y = -cardHeight;
            scale = 0.92;
          } else if (exitDirection === "skip-down") {
            // Skip Phase 2: Move back DOWN behind the deck
            y = VISIBLE_CARDS * 12;
            scale = 1 - VISIBLE_CARDS * 0.05;
            zIndex = 0;
          } else if (exitDirection === "rewind-start") {
            // Rewind Phase 1: Position behind the deck (NO animation)
            y = VISIBLE_CARDS * 12;
            scale = 1 - VISIBLE_CARDS * 0.05;
            zIndex = 0; // Behind other cards
          } else if (exitDirection === "rewind-up") {
            // Rewind Phase 2: Animate UP while still behind the deck
            y = -cardHeight;
            scale = 0.92;
            zIndex = 0; // Stay behind other cards
          } else if (exitDirection === "rewind-down") {
            // Rewind Phase 3: Animate DOWN into top position (now on top)
            y = 0;
            scale = 1;
            zIndex = VISIBLE_CARDS + 1; // Come to front
          } else {
            // Swipe left/right animation
            x = exitDirection === "right" ? window.innerWidth : -window.innerWidth;
            rotate = exitDirection === "right" ? 30 : -30;
          }
        }

        return (
          <div
            key={market.id}
            {...(isTop && !isExiting ? bind() : {})}
            className={cn(
              "absolute touch-none select-none",
              isTop && "cursor-grab active:cursor-grabbing"
            )}
            style={{
              transform: `
                translateX(${x}px) 
                translateY(${y + translateY}px) 
                rotate(${rotate}deg) 
                scale(${scale})
              `,
              zIndex,
              opacity,
              transition: isExiting 
                ? isRewindStart
                  ? "none" // No animation for initial positioning
                  : (isSkipping || isRewinding)
                    ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : (dragState.isActive && isTop)
                  ? "none" // No transition while dragging for responsiveness
                  : "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)", // Smooth ease-out for all cards promoting up
            }}
          >
            <SwipeCard
              market={market}
              onBet={onBet}
              onSkip={handleSkip}
              onRewind={handleRewind}
              isPending={isPending}
              dragX={isTop ? dragState.x : 0}
            />
          </div>
        );
      })}

      {/* Swipe indicators - different based on mode */}
      {interactionMode === "tap" ? (
        /* Tap mode: Skip/Next indicators */
        <>
          <div
            className={cn(
              "absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none",
              "px-6 py-3 rounded-2xl font-bold text-xl uppercase tracking-wider",
              "border-4 border-white/50 text-white/80 bg-white/10",
              "transition-opacity duration-200",
              dragState.x < -50 ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: `translateY(-50%) rotate(-15deg)` }}
          >
            Next
          </div>
          <div
            className={cn(
              "absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none",
              "px-6 py-3 rounded-2xl font-bold text-xl uppercase tracking-wider",
              "border-4 border-white/50 text-white/80 bg-white/10",
              "transition-opacity duration-200",
              dragState.x > 50 ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: `translateY(-50%) rotate(15deg)` }}
          >
            Next
          </div>
        </>
      ) : (
        /* Swipe mode: No/Yes bet indicators */
        <>
          <div
            className={cn(
              "z-50 absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none",
              "px-6 py-3 rounded-2xl font-bold text-xl uppercase tracking-wider",
              "border-4 border-rose-500 text-rose-500 bg-rose-500/10",
              "transition-opacity duration-200",
              dragState.x < -50 ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: `translateY(-50%) rotate(-15deg)` }}
          >
            No
          </div>
          <div
            className={cn(
              "z-50 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none",
              "px-6 py-3 rounded-2xl font-bold text-xl uppercase tracking-wider",
              "border-4 border-emerald-500 text-emerald-500 bg-emerald-500/10",
              "transition-opacity duration-200",
              dragState.x > 50 ? "opacity-100" : "opacity-0"
            )}
            style={{ transform: `translateY(-50%) rotate(15deg)` }}
          >
            Yes
          </div>
        </>
      )}
    </div>
  );
};

