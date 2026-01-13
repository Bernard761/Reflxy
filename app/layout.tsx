import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import Providers from "@/app/providers";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} min-h-screen font-sans antialiased`}
      >
        <div className="relative min-h-screen">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_8%_0%,rgba(132,199,185,0.35),transparent_70%),radial-gradient(40%_40%_at_88%_8%,rgba(255,204,172,0.35),transparent_65%),radial-gradient(70%_60%_at_50%_100%,rgba(254,238,210,0.55),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:64px_64px]"
          />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
