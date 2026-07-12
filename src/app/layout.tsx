import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { AppCacheSessionSync } from "@/components/AppCacheSessionSync";
import { EventProvider } from "@/hooks/event-provider/event-provider";

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
    <html lang="en" className={jetbrainsMono.variable}>
      <body>
        <AppCacheSessionSync />
        <EventProvider>{children}</EventProvider>
      </body>
    </html>
  );
}
