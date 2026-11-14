import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkyBackdrop } from "@/components/layout/SkyBackdrop";
import { PROJECT } from "@/config/project";

import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "sans-serif"],
});

const plexMono = localFont({
  src: [
    {
      path: "./fonts/IBMPlexMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-plex",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  applicationName: PROJECT.name,
  title: {
    default: "Earth's Pulse — NASA ocean data, translated",
    template: `%s — ${PROJECT.name}`,
  },
  description: PROJECT.description,
  keywords: [
    "NASA",
    "sonification",
    "ECCO2",
    "ocean currents",
    "sea surface temperature",
    "Scientific Visualization Studio",
    "data visualization",
  ],
  authors: [{ name: "Earth's Pulse project" }],
  creator: "Earth's Pulse project",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: PROJECT.name,
    title: "Earth's Pulse — NASA ocean data, translated",
    description: PROJECT.description,
  },
  twitter: {
    card: "summary",
    title: "Earth's Pulse — NASA ocean data, translated",
    description: PROJECT.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080d16",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${inter.variable} ${plexMono.variable}`}
      lang="en"
    >
      <body>
        <SkyBackdrop />
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        <main className="site-main" id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
