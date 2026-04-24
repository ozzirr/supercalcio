import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOLAZOO | Football Manager",
  description: "Costruisci la tua squadra dei sogni, definisci la tattica e domina l'Arena in GOLAZOO, il manageriale calcistico next-gen.",
  openGraph: {
    title: "GOLAZOO | Football Manager",
    description: "Scendi in campo! Costruisci la tua squadra e sfida altri manager nell'Arena.",
    url: "https://golazoo.app",
    siteName: "GOLAZOO",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1024,
        height: 1024,
        alt: "GOLAZOO Promo Image",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOLAZOO | Football Manager",
    description: "Scendi in campo! Costruisci la tua squadra e sfida altri manager nell'Arena.",
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export const viewport = {
  themeColor: "#05070a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
