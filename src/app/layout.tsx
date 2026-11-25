import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jobbly.vercel.app";
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Jobbly — Job Management & Invoicing for Contractors",
    template: "%s | Jobbly",
  },
  description:
    "Fast, simple job management, professional estimates, and invoicing built specifically for plumbers, electricians, painters, HVAC & US contractors.",
  keywords: [
    "contractor software",
    "invoice maker",
    "job scheduling",
    "estimates and quotes",
    "plumbing invoice app",
    "electrician jobs SaaS",
    "field service management",
  ],
  authors: [{ name: "Jobbly Team" }],
  creator: "Jobbly",
  publisher: "Jobbly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Jobbly — Job Management & Invoicing for Contractors",
    description:
      "Win more jobs and get paid faster. Professional estimates, job scheduling, and one-click invoicing built for trade contractors.",
    siteName: "Jobbly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jobbly — Contractor Job Management & Invoicing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobbly — Job Management & Invoicing for Contractors",
    description:
      "Win more jobs and get paid faster. Professional estimates, job scheduling, and one-click invoicing built for trade contractors.",
    images: ["/og-image.png"],
    creator: "@jobbly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Google AdSense Global Monetization Integration */}
        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Social link preview cover image tags */}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body className="antialiased font-body min-h-screen bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
