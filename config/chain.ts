import { abstract, abstractTestnet } from "viem/chains";
import { NETWORK } from "@/lib/config";

export const chain = NETWORK.id === abstract.id ? abstract : abstractTestnet;

