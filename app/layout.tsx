import type { Metadata } from "next";
import { Atmosphere } from "@/app/components/Atmosphere";
import { Motion } from "@/app/components/Motion";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cordiallymel.github.io"),
  title: {
    default: "Mel Searles — Software engineer, full-stack TypeScript & Python",
    template: "%s · Mel Searles",
  },
  description:
    "Mel Searles is a software engineer in New York building full-stack systems in TypeScript, React, Node, Python, and SQL — market-research platforms, execution tooling, and this site. Economics student at CUNY and founder of SkyQuant.",
  keywords: [
    "Mel Searles",
    "software engineer",
    "full-stack developer",
    "TypeScript developer",
    "React developer",
    "Node.js developer",
    "Python developer",
    "market data engineer",
    "quantitative developer",
    "SQL",
    "New York",
    "SkyQuant",
  ],
  authors: [{ name: "Melchezidek Searles" }],
  creator: "Melchezidek Searles",
  openGraph: {
    type: "website",
    siteName: "Mel Searles",
    title: "Mel Searles — Software engineer, full-stack TypeScript & Python",
    description:
      "I build full-stack systems with a researcher's discipline. TypeScript, React, Node, Python, SQL, and reproducible evidence.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Mel Searles — software engineer, full-stack TypeScript and Python" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mel Searles — Software engineer, full-stack TypeScript & Python",
    description:
      "I build full-stack systems with a researcher's discipline. TypeScript, React, Node, Python, SQL, and reproducible evidence.",
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
