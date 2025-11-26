"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";

import { chain } from "@/config/chain";
import { wagmiConfig } from "@/config/wagmi";

export function NextAbstractWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AbstractWalletProvider chain={chain}>{children}</AbstractWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

