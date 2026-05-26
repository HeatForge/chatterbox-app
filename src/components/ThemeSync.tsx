import { useEffect } from "react";

import {
  applyThemeToDocument,
  SETTINGS_CHANGE_EVENT,
  settings,
} from "~/lib/userSettings";

/** Applies persisted theme to `document.documentElement` and listens for system preference. */
export function ThemeSync() {
  useEffect(() => {
    const sync = () => applyThemeToDocument(settings.get().theme);
    sync();

    const onSettingsChange = () => sync();
    window.addEventListener(SETTINGS_CHANGE_EVENT, onSettingsChange);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (settings.get().theme === "system") sync();
    };
    media.addEventListener("change", onSystemChange);

    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, onSettingsChange);
      media.removeEventListener("change", onSystemChange);
    };
  }, []);

  return null;
}
