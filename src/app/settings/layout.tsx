import { SettingsInitialDataProvider } from "@/components/settings/SettingsInitialDataProvider";
import { getAiSettingsShell } from "@/lib/services/ai-providers";
import { getServerUserId } from "@/lib/services/session";

/**
 * Sends database-backed settings to the first render without blocking on
 * external provider model catalogs.
 */
export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getServerUserId();
  const initialConfig = await getAiSettingsShell(userId);

  return (
    <SettingsInitialDataProvider initialConfig={initialConfig}>
      {children}
    </SettingsInitialDataProvider>
  );
}
