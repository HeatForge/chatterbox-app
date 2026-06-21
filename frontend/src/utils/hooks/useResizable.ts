import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  side: "left" | "right";
}

export function useResizable({
  initialWidth,
  minWidth,
  maxWidth,
  side,
}: UseResizableOptions) {
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      startX.current = event.clientX;
      startWidth.current = width;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [width],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;

      const delta = event.clientX - startX.current;
      const next =
        side === "left"
          ? startWidth.current + delta
          : startWidth.current - delta;

      setWidth(Math.min(maxWidth, Math.max(minWidth, next)));
    },
    [maxWidth, minWidth, side],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dragging.current = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    width,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      role: "separator" as const,
      "aria-orientation": "vertical" as const,
      "aria-valuenow": width,
      tabIndex: 0,
    },
  };
}
