"use client";

/**
 * Auth Gate Component
 *
 * Full-screen overlay prompting wallet connection before accessing the swipe UI.
 * Features a visually engaging design with animated background.
 */

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { Wallet, Loader2, TrendingUp, Zap, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

// =============================================================================
// Component
// =============================================================================

export const AuthGate = () => {
  const { login } = useLoginWithAbstract();
  const { status, isConnecting, isReconnecting } = useAccount();

  const isLoading = status === "connecting" || status === "reconnecting" || isConnecting || isReconnecting;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center ">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-rose-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-violet-500/10 via-transparent to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-black text-white">M</span>
          </div>
          <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-xl -z-10" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Prediction Markets
        </h1>
        <p className="text-lg text-white/60 mb-8">
          Swipe through markets. Bet on outcomes. Win big.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10 w-full">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
            <Zap className="h-6 w-6 text-amber-400" />
            <span className="text-xs text-white/70 font-medium">Quick Bets</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <span className="text-xs text-white/70 font-medium">Live Odds</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-xs text-white/70 font-medium">On-chain</span>
          </div>
        </div>

        {/* Connect Button */}
        <Button
          onClick={login}
          disabled={isLoading}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-white text-zinc-900 hover:bg-white/90 shadow-lg shadow-white/20 transition-all hover:shadow-white/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </>
          )}
        </Button>

        <p className="mt-4 text-xs text-white/40">
          Powered by Abstract Global Wallet
        </p>
      </div>
    </div>
  );
};

