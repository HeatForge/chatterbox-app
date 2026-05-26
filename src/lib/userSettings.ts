export type ThemePreference = "light" | "dark" | "system";

export interface UserSettings {
  theme: ThemePreference;
}

const STORAGE_KEY = "chatterbox:user-settings";
export const SETTINGS_CHANGE_EVENT = "chatterbox:settings-change";

const defaultSettings: UserSettings = {
  theme: "system",
};

function readStorage(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

function writeStorage(next: UserSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
}

export const settings = {
  get(): UserSettings {
    return readStorage();
  },
  update(partial: Partial<UserSettings>): UserSettings {
    const next = { ...readStorage(), ...partial };
    writeStorage(next);
    return next;
  },
};

export function resolveTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyThemeToDocument(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
}
