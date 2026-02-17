import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { CollectionsProvider } from "@/providers/collections-provider";

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
    <html lang="en">
      <body className="antialiased">
        <CollectionsProvider>
          <main className="has-bottom-nav min-h-dvh">{children}</main>
          <BottomNav />
        </CollectionsProvider>
      </body>
    </html>
  );
}
