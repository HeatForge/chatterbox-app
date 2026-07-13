import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { AppCacheSessionSync } from "@/components/AppCacheSessionSync";
import { AppProviders } from "@/components/app-providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Chatterbox",
  description: "Chat with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", jetbrainsMono.variable)}>
      <body>
        <AppCacheSessionSync />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
