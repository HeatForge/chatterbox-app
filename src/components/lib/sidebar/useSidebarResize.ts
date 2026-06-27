"use client";

import { useCallback, useRef } from "react";

type UseSidebarResizeOptions = {
  enabled: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
};

export function useSidebarResize({
  enabled,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
}: UseSidebarResizeOptions) {
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!enabled || event.button !== 0) {
        return;
      }

      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      dragStateRef.current = { startX: event.clientX, startWidth: width };
      document.body.style.userSelect = "none";

      function finishDrag(pointerId: number): void {
        dragStateRef.current = null;
        document.body.style.userSelect = "";
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      }

      function onPointerMove(moveEvent: PointerEvent): void {
        const dragState = dragStateRef.current;
        if (!dragState) {
          return;
        }

        const delta = moveEvent.clientX - dragState.startX;
        const nextWidth = Math.min(
          maxWidth,
          Math.max(minWidth, dragState.startWidth + delta),
        );
        onWidthChange(nextWidth);
      }

      function onPointerUp(upEvent: PointerEvent): void {
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        handle.removeEventListener("pointercancel", onPointerUp);
        finishDrag(upEvent.pointerId);
      }

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
      handle.addEventListener("pointercancel", onPointerUp);
    },
    [enabled, width, minWidth, maxWidth, onWidthChange],
  );

  return { onResizePointerDown };
}
