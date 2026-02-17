import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { CollectionsProvider } from "@/providers/collections-provider";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-primary",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-secondary",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memzo",
  description: "AI-powered flashcard learning app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Memzo",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="antialiased">
        <CollectionsProvider>
          <main className="has-bottom-nav min-h-dvh">{children}</main>
          <BottomNav />
        </CollectionsProvider>
      </body>
    </html>
  );
}
