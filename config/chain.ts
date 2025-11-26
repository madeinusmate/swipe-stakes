import { abstract, abstractTestnet } from "viem/chains";

export const chain =
  process.env.NEXT_PUBLIC_ABSTRACT_ENV === "mainnet"
    ? abstract
    : abstractTestnet;

