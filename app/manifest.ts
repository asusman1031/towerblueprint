import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tower Blueprints for Kids",
    short_name: "Tower Blueprints",
    description: "Official step-by-step blueprints for giant magnetic block towers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1146b8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
