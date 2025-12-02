"use client";

/**
 * Bet Settings Context
 *
 * Provides quick bet amount and interaction mode configuration that persists to localStorage.
 * Used by the swipe UI for quick betting and configurable in the profile page.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { QUICK_BET_AMOUNT } from "./config";

// =============================================================================
// Types
// =============================================================================

export type InteractionMode = "tap" | "swipe";

interface BetSettingsContextValue {
  /** Current quick bet amount in USD */
  quickBetAmount: number;
  /** Update the quick bet amount */
  setQuickBetAmount: (amount: number) => void;
  /** Current interaction mode - tap (buttons) or swipe (gestures) */
  interactionMode: InteractionMode;
  /** Update the interaction mode */
  setInteractionMode: (mode: InteractionMode) => void;
}

// =============================================================================
// Context
// =============================================================================

const BetSettingsContext = createContext<BetSettingsContextValue | null>(null);

const STORAGE_KEY_AMOUNT = "myriad-quick-bet-amount";
const STORAGE_KEY_MODE = "myriad-interaction-mode";

// =============================================================================
// Provider
// =============================================================================

export const BetSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [quickBetAmount, setQuickBetAmountState] = useState<number>(QUICK_BET_AMOUNT);
  const [interactionMode, setInteractionModeState] = useState<InteractionMode>("tap");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedAmount = localStorage.getItem(STORAGE_KEY_AMOUNT);
    if (storedAmount) {
      const parsed = parseFloat(storedAmount);
      if (!isNaN(parsed) && parsed > 0) {
        setQuickBetAmountState(parsed);
      }
    }

    const storedMode = localStorage.getItem(STORAGE_KEY_MODE);
    if (storedMode === "tap" || storedMode === "swipe") {
      setInteractionModeState(storedMode);
    }

    setIsHydrated(true);
  }, []);

  // Save amount to localStorage when it changes
  const setQuickBetAmount = useCallback((amount: number) => {
    if (amount > 0 && amount <= 1000) {
      setQuickBetAmountState(amount);
      localStorage.setItem(STORAGE_KEY_AMOUNT, amount.toString());
    }
  }, []);

  // Save mode to localStorage when it changes
  const setInteractionMode = useCallback((mode: InteractionMode) => {
    setInteractionModeState(mode);
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }, []);

  // Don't render children until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <BetSettingsContext.Provider value={{ 
      quickBetAmount, 
      setQuickBetAmount,
      interactionMode,
      setInteractionMode,
    }}>
      {children}
    </BetSettingsContext.Provider>
  );
};

// =============================================================================
// Hook
// =============================================================================

export const useBetSettings = (): BetSettingsContextValue => {
  const context = useContext(BetSettingsContext);
  if (!context) {
    throw new Error("useBetSettings must be used within a BetSettingsProvider");
  }
  return context;
};

