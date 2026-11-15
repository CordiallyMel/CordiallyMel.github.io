import type { Metadata } from "next";
import { Atmosphere } from "@/app/components/Atmosphere";
import { Motion } from "@/app/components/Motion";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cordiallymel.github.io"),
  title: {
    default: "Mel Searles — Market systems, software, economics",
    template: "%s · Mel Searles",
  },
  description:
    "Mel Searles builds reproducible market-research and execution systems in Python, SQL, and TypeScript. Economics student at CUNY, founder of SkyQuant, and future economics professor.",
  keywords: [
    "Mel Searles",
    "Python developer",
    "market data engineer",
    "quantitative developer",
    "SQL",
    "TypeScript",
    "New York",
    "SkyQuant",
  ],
  authors: [{ name: "Melchezidek Searles" }],
  creator: "Melchezidek Searles",
  openGraph: {
    type: "website",
    siteName: "Mel Searles",
    title: "Mel Searles — Market systems, software, economics",
    description:
      "I build market systems with a researcher's discipline. Python, SQL, TypeScript, and reproducible evidence.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Mel Searles — market systems, software, economics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mel Searles — Market systems, software, economics",
    description:
      "I build market systems with a researcher's discipline. Python, SQL, TypeScript, and reproducible evidence.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Atmosphere />
        <Motion />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
