import { useContext } from "react";

import { OverlayContext } from "./OverlayContext";
import { type OverlayContextValue } from "./types";

export function useOverlay(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error("useOverlay must be used within OverlayProvider");
  }
  return value;
}
