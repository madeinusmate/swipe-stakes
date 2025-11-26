import { queryOptions } from "@tanstack/react-query";

const ABSTRACT_API_URL = "https://api.portal.abs.xyz/api/v1";

export interface AbstractProfile {
  address: string;
  name: string;
  description: string;
  profilePictureUrl: string;
  tier: string;
}

export const profileKeys = {
  all: ["profile"] as const,
  address: (address: string) => [...profileKeys.all, address] as const,
};

async function fetchAbstractProfile(address: string): Promise<AbstractProfile | null> {
  try {
    const response = await fetch(`${ABSTRACT_API_URL}/user/profile/${address}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch abstract profile");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching abstract profile:", error);
    return null;
  }
}

export const abstractProfileQueryOptions = (address?: string) => queryOptions({
  queryKey: profileKeys.address(address || ""),
  queryFn: () => fetchAbstractProfile(address!),
  enabled: !!address,
  staleTime: 1000 * 60 * 60, // 1 hour
});

