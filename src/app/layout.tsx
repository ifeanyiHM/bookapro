import type { Metadata, Viewport } from "next";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/instrument-sans";
import { SITE } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_NG", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { themeColor: "#f5f2ea", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
