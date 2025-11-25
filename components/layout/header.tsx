"use client";

/**
 * Header Component
 *
 * Main navigation header with:
 * - Logo/brand
 * - Navigation links
 * - Network switcher (testnet/mainnet)
 * - Wallet connection button
 */

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNetwork } from "@/lib/network-context";
import { cn } from "@/lib/utils";

// =============================================================================
// Network Switcher
// =============================================================================

/**
 * Toggle button for switching between testnet and mainnet.
 * Visual indicator shows which network is currently selected.
 */
function NetworkSwitcher() {
  const { network, toggleNetwork, isTestnet } = useNetwork();

  return (
    <button
      onClick={toggleNetwork}
      className={cn(
        "relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        "border border-border hover:bg-accent",
        isTestnet
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      )}
      title={`Switch to ${isTestnet ? "mainnet" : "testnet"}`}
    >
      {/* Status dot */}
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isTestnet ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      <span className="capitalize">{network}</span>
    </button>
  );
}

// =============================================================================
// Navigation Links
// =============================================================================

const navLinks = [
  { href: "/", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

function NavLinks() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

// =============================================================================
// Header Component
// =============================================================================

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            {/* CUSTOMIZE: Replace with your logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Myriad</span>
          </Link>
          <NavLinks />
        </div>

        {/* Right side: Network + Wallet */}
        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </header>
  );
}

