import type { Metadata, Viewport } from "next";
import "@fontsource/lilita-one";
import "@fontsource-variable/nunito";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://towerblueprintsforkids.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tower Blueprints for Kids | Build giant magnetic block towers",
    template: "%s | Tower Blueprints for Kids",
  },
  description:
    "Official step-by-step blueprints for giant magnetic block towers, designed and tested by Sawyer, a 7-year-old architect.",
  openGraph: {
    title: "Tower Blueprints for Kids",
    description: "Official step-by-step blueprints for giant magnetic block towers, designed by a 7-year-old architect.",
    images: ["/brand/logo.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1146b8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
