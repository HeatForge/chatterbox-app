import { createContext } from "react";

import { type OverlayContextValue } from "./types";

export const OverlayContext = createContext<OverlayContextValue | null>(null);
