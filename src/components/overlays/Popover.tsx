import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { type PopoverState } from "./types";
import styles from "./Popover.module.css";

interface PopoverProps {
  state: PopoverState;
  onClose: () => void;
}

export function Popover({ state, onClose }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const anchor = state.anchorRef.current;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const rect = anchor.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + popRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popRect.width - 8;
    }
    if (top + popRect.height > window.innerHeight - 8) {
      top = rect.top - popRect.height - 8;
    }

    setPosition({ top: Math.max(8, top), left: Math.max(8, left) });
  }, [state.anchorRef, state.content]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (state.anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, state.anchorRef]);

  return (
    <div
      ref={popoverRef}
      className={styles.popover}
      style={{ top: position.top, left: position.left }}
      role="dialog"
    >
      {state.content}
    </div>
  );
}
