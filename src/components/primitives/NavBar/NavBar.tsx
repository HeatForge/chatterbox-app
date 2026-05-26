import Link from "next/link";
import { useRouter } from "next/router";

import { AppIcon, Icon } from "~/components/primitives/Icon";

import styles from "./NavBar.module.css";

const navItems = [
  { href: "/chat", label: "Chat", icon: AppIcon.Chat },
  { href: "/settings", label: "Settings", icon: AppIcon.Settings },
  { href: "/admin", label: "Admin", icon: AppIcon.Admin },
] as const;

export function NavBar() {
  const router = useRouter();

  return (
    <nav className={styles.root} aria-label="Main">
      {navItems.map(({ href, label, icon }) => {
        const active =
          router.pathname === href || router.pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={[styles.link, active ? styles.linkActive : ""]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={icon} size="sm" />
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
