/**
 * Wagmi Configuration
 *
 * Configures the wagmi client with:
 * - Chain: Abstract mainnet or testnet based on config
 * - Connector: Abstract Global Wallet connector for seamless onboarding
 * - Transports: HTTP transports for RPC communication
 * - SSR: Enabled for Next.js server-side rendering compatibility
 */

import { createConfig, http } from "wagmi";
import { abstract, abstractTestnet } from "viem/chains";
import { chain } from "./chain";
import { abstractWalletConnector } from "@abstract-foundation/agw-react/connectors";

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [abstractWalletConnector()],
  transports: {
    [abstract.id]: http(),
    [abstractTestnet.id]: http(),
  },
  ssr: true,
});

