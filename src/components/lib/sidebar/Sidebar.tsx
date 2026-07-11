"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/lib/button/Button";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import { MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, SIDEBAR_ID } from "./constants";
import { useSidebar } from "./SidebarProvider";
import styles from "./sidebar.module.css";
import { useSidebarResize } from "./useSidebarResize";

type SidebarProps = {
  children: ReactNode;
  footer?: ReactNode;
  title?: string;
};

function SidebarLockButton() {
  const { locked, isMobile, toggleLocked } = useSidebar();

  if (isMobile) {
    return null;
  }

  return (
    <Button
      leftIcon={locked ? IconNames["lock-fill"] : IconNames["unlock-line"]}
      intent={Intent.TERTIARY}
      iconSize={18}
      minimal
      onClick={toggleLocked}
      aria-pressed={locked}
      aria-label={locked ? "Unlock sidebar" : "Lock sidebar open"}
    />
  );
}

export function Sidebar({ children, footer, title = "Threads" }: SidebarProps) {
  const { open, width, isMobile, setOpen, setWidth } = useSidebar();
  const resizeEnabled = open && !isMobile;

  const { onResizePointerDown } = useSidebarResize({
    enabled: resizeEnabled,
    width,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
    onWidthChange: setWidth,
  });

  if (isMobile && !open) {
    return null;
  }

  const panelContent = (
    <>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <SidebarLockButton />
        </header>
        <div className={styles.content}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
      {resizeEnabled ? (
        <button
          type="button"
          className={styles.resizeHandle}
          aria-label="Resize sidebar"
          onPointerDown={onResizePointerDown}
        />
      ) : null}
    </>
  );

  if (isMobile && open) {
    return (
      <div className={styles.mobileOverlay}>
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
        />
        <div
          id={SIDEBAR_ID}
          className={[styles.sidebar, styles.mobile, styles.open].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {panelContent}
        </div>
      </div>
    );
  }

  return (
    <aside
      id={SIDEBAR_ID}
      className={[
        styles.sidebar,
        styles.desktop,
        open ? styles.open : styles.closed,
      ].join(" ")}
      style={{ width: open ? width : 0 }}
    >
      {panelContent}
    </aside>
  );
}
