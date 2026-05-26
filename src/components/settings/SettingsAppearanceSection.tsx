import { useEffect, useState } from "react";

import { AppIcon, Icon } from "~/components/primitives/Icon";
import { type ThemePreference, settings } from "~/lib/userSettings";

import styles from "./SettingsAppearanceSection.module.css";

const options: { value: ThemePreference; label: string; icon: AppIcon }[] = [
  { value: "light", label: "Light", icon: AppIcon.Sun },
  { value: "dark", label: "Dark", icon: AppIcon.Moon },
  { value: "system", label: "System", icon: AppIcon.Settings },
];

export function SettingsAppearanceSection() {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    setTheme(settings.get().theme);
  }, []);

  const handleChange = (value: ThemePreference) => {
    setTheme(value);
    settings.update({ theme: value });
  };

  return (
    <section className={styles.root} aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className={styles.title}>
        Appearance
      </h2>
      <p className={styles.hint}>Choose light, dark, or match your operating system.</p>
      <div className={styles.options} role="radiogroup" aria-label="Theme">
        {options.map(({ value, label, icon }) => (
          <label key={value} className={styles.option}>
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => handleChange(value)}
              className={styles.radio}
            />
            <Icon name={icon} size="sm" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
