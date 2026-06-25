"use client";

import { useEventContext } from "@/hooks/event-provider/event-provider";
import type { BannerOptions } from "./types";

export function useBanner(): (options: BannerOptions) => string {
  const { showBanner } = useEventContext();
  return showBanner;
}
