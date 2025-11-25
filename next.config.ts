import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Server external packages.
   * These packages will not be bundled for server-side rendering.
   * This helps avoid issues with Node.js-only dependencies.
   */
  serverExternalPackages: [
    "polkamarkets-js",
    "jsdom",
    "canvas",
    "pino",
    "thread-stream",
  ],

  /**
   * Image domains for market images.
   * CUSTOMIZE: Add domains where your market images are hosted.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
