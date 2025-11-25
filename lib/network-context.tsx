"use client";

/**
 * Network Context
 *
 * Provides a way to switch between testnet and mainnet throughout the app.
 * This context is separate from the wallet's connected chain - it controls
 * which API endpoints and contract addresses are used.
 *
 * The user can be connected to mainnet but viewing testnet markets, though
 * trading will require switching their wallet to the matching network.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type NetworkKey, DEFAULT_NETWORK, NETWORKS, getApiBaseUrl, getContracts, getTokens } from "./config";

// =============================================================================
// Context Types
// =============================================================================

interface NetworkContextValue {
  /** Currently selected network (testnet or mainnet) */
  network: NetworkKey;
  /** Switch to a different network */
  setNetwork: (network: NetworkKey) => void;
  /** Toggle between testnet and mainnet */
  toggleNetwork: () => void;
  /** Network configuration for the current network */
  networkConfig: (typeof NETWORKS)[NetworkKey];
  /** API base URL for the current network */
  apiBaseUrl: string;
  /** Contract addresses for the current network */
  contracts: ReturnType<typeof getContracts>;
  /** Token configurations for the current network */
  tokens: ReturnType<typeof getTokens>;
  /** Whether currently on testnet */
  isTestnet: boolean;
}

// =============================================================================
// Context
// =============================================================================

const NetworkContext = createContext<NetworkContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface NetworkProviderProps {
  children: ReactNode;
  /** Initial network (defaults to DEFAULT_NETWORK from config) */
  initialNetwork?: NetworkKey;
}

/**
 * Provider component for network selection.
 *
 * @example
 * ```tsx
 * <NetworkProvider initialNetwork="testnet">
 *   <App />
 * </NetworkProvider>
 * ```
 */
export function NetworkProvider({ children, initialNetwork = DEFAULT_NETWORK }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<NetworkKey>(initialNetwork);

  const setNetwork = useCallback((newNetwork: NetworkKey) => {
    setNetworkState(newNetwork);
    // Persist selection to localStorage for returning users
    if (typeof window !== "undefined") {
      localStorage.setItem("myriad-network", newNetwork);
    }
  }, []);

  const toggleNetwork = useCallback(() => {
    setNetwork(network === "testnet" ? "mainnet" : "testnet");
  }, [network, setNetwork]);

  const value: NetworkContextValue = {
    network,
    setNetwork,
    toggleNetwork,
    networkConfig: NETWORKS[network],
    apiBaseUrl: getApiBaseUrl(network),
    contracts: getContracts(network),
    tokens: getTokens(network),
    isTestnet: network === "testnet",
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access network context.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { network, toggleNetwork, isTestnet } = useNetwork();
 *   return (
 *     <button onClick={toggleNetwork}>
 *       Current: {network} ({isTestnet ? "Test" : "Production"})
 *     </button>
 *   );
 * }
 * ```
 */
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}

