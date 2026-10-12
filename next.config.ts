import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ashton named his tower after it went up as the "Ring Tower". Keep old links working (the ?key= comes along).
  async redirects() {
    return [
      { source: "/blueprints/ring-tower", destination: "/blueprints/dragon-tower", permanent: true },
      { source: "/print/ring-tower", destination: "/print/dragon-tower", permanent: true },
    ];
  },
  experimental: {
    // Room for Sawyer's original blueprint files uploaded from HQ (Vercel caps requests at 4.5 MB).
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
