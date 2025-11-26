import { createPublicClient, createWalletClient, http } from "viem";
import { eip712WalletActions } from "viem/zksync";

import { chain } from "./chain";

export const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: chain,
  transport: http(),
}).extend(eip712WalletActions());

