import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
