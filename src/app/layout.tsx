import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/config/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

// latin-ext is included so the naira sign (₦) is covered.
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["AC technician Lagos", "electrician Lagos", "plumber Lagos", "home cleaning Lagos", "book home repairs online", SITE.name],
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token from Google Search Console.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_NG", title: SITE.name, description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={manrope.variable}>
      <body className="min-h-screen antialiased">
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        {children}
      </body>
    </html>
  );
}
