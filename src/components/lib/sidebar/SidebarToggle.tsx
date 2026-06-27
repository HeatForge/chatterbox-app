"use client";

import { Button } from "@/components/lib/button/Button";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import { SIDEBAR_ID } from "./constants";
import { useSidebar } from "./SidebarProvider";

export function SidebarToggle() {
  const { open, toggleOpen } = useSidebar();

  return (
    <Button
      leftIcon={
        open
          ? IconNames["layout-leftbar-close-line"]
          : IconNames["layout-leftbar-open-line"]
      }
      intent={Intent.TERTIARY}
      iconSize={20}
      onClick={toggleOpen}
      aria-expanded={open}
      aria-controls={SIDEBAR_ID}
      aria-label={open ? "Close sidebar" : "Open sidebar"}
    />
  );
}
