"use client";

import { createContext, useContext, useState } from "react";

import type { AiSettingsConfig } from "@/lib/services/ai-providers";

const SettingsInitialDataContext = createContext<AiSettingsConfig | null>(null);

/**
 * Provides the fast server-rendered settings shell while the client refreshes
 * provider model catalogs in the background.
 */
export function SettingsInitialDataProvider({
  initialConfig,
  children,
}: Readonly<{
  initialConfig: AiSettingsConfig;
  children: React.ReactNode;
}>) {
  const [config] = useState(initialConfig);
  return (
    <SettingsInitialDataContext.Provider value={config}>
      {children}
    </SettingsInitialDataContext.Provider>
  );
}

/** Returns the settings shell loaded by the `/settings` server layout. */
export function useSettingsInitialData(): AiSettingsConfig | null {
  return useContext(SettingsInitialDataContext);
}
