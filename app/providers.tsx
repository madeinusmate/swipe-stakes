"use client";

/**
 * App Providers
 *
 * This file wraps the application with all necessary providers:
 * - WagmiProvider: Wallet connection and blockchain interactions
 * - QueryClientProvider: TanStack Query for data fetching
 * - RainbowKitProvider: Wallet connection UI
 * - NetworkProvider: Network configuration
 *
 * The provider order matters - outer providers are available to inner ones.
 */

import { type ReactNode } from "react";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { NetworkProvider } from "@/lib/network-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextAbstractWalletProvider>
      <NetworkProvider>
        {children}
      </NetworkProvider>
    </NextAbstractWalletProvider>
  );
}

