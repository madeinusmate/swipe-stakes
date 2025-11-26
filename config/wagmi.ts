import { createConfig, http } from "wagmi";
import { chain } from "./chain";
import { abstractWalletConnector } from "@abstract-foundation/agw-react/connectors";

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [abstractWalletConnector()],
  transports: {
    [chain.id]: http(),
  },
  ssr: true,
});

