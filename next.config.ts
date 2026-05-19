import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gameball widget has a localhost-special-case that fetches its data files
  // from `${origin}/dist/widget/data/...` instead of the CDN. Proxy them through.
  async rewrites() {
    return [
      {
        source: "/dist/widget/:path*",
        destination: "https://assets.gameball.co/widget/:path*",
      },
    ];
  },
};

export default nextConfig;
