import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/content";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://7starfoundation.org"),
    title: { default: s.seo.title, template: "%s | 7 Star Help Foundation" },
    description: s.seo.description,
    icons: { icon: "/icon.png", apple: "/icon.png" },
    openGraph: { title: s.seo.title, description: s.seo.description, images: ["/images/1.jpg"] },
  };
}

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#FFF8E9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
